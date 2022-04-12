### NOTES ####

<template>
    <span @mousedown="onMouseDown" @touchstart="onMouseDown">
        {{ node.name }}
    </span>    
</template>

<script>
import { EventBus } from "@/utils/event-bus.js"
export default {
    props: ['node', 'columns', 'type'],

    data(){
        return {
            selectedNode: {},
            instance: {},
        }
    },

    mounted(){
        this.instance = this.$el.cloneNode(true)
    },

    methods: {
        onMouseDown(e){

            if(e.touches){
                document.addEventListener("touchmove", this.onMouseMove);
                document.addEventListener("touchend", this.onMouseUp);
            }
            else{
                document.addEventListener('mousemove', this.onMouseMove)
                document.addEventListener('mouseup', this.onMouseUp)
            }

            let { left, top, height, width } = this.$el.getClientRects()[0];
 
            this.instance.style.cssText = `position:absolute;left:${left}px;top:${top}px;height:min-content;px;width:${width / 2}px`
            this.instance.classList.add('clone')

            document.body.append(this.instance)
        },

        onMouseMove(e){

            const touch = e.touches ? e.touches[0] : null

            // DRAGDROP SCROLLABLE
            let scrollY = document.documentElement.scrollTop || document.body.scrollTop;

            let { clientX, clientY, offsetX, offsetY, pageX, pageY } = e

            let { width, height } = this.instance.getClientRects()[0]

            let mouseDataValues = {
                clientX: touch ? touch.clientX - (touch.target.clientWidth / 2) : clientX - (width / 2),
                clientY: touch ? touch.clientY - (touch.target.clientHeight / 2) + scrollY : clientY - (height / 2) + scrollY,
                offsetX: offsetX,
                offsetY: offsetY,
                pageX: pageX,
                pageY: pageY,
            }

            this.instance.style.left = `${mouseDataValues.clientX}px`  
            this.instance.style.top = `${mouseDataValues.clientY}px` 

            const dropable = this.checkIfDropable()

            if(dropable){
                this.instance.style.cursor = "cell"
            } 
            else{
                this.instance.style.cursor = "not-allowed"
            }
        },

        onMouseUp(e){
            // use stop propgation to prevent bubbeling that causes this method to be called multiple times
            e.stopPropagation()

            document.removeEventListener("touchmove", this.onMouseMove);
            document.removeEventListener("touchend", this.onMouseUp);

            document.removeEventListener('mousemove', this.onMouseMove)
            document.removeEventListener('mousedown', this.onMouseDown)
            document.removeEventListener('mouseup', this.onMouseUp)

            const dropable = this.checkIfDropable()

            if(dropable){
                // emits to LogicContent.vue
                EventBus.$emit('addNode', this.node)
            }

            if(this.instance){
                this.instance.parentNode.removeChild(this.instance)
            }

            for(let key in this.columns){
                this.columns[key].classList.remove('col-hl')
            }
        },

        checkIfDropable(){
            let { top, right, bottom, left } = this.instance.getClientRects()[0];

            let bounds = this.columns[this.type].getClientRects()[0]

            if(!bounds) return 

            let horizontalCheck = left > bounds.left  && right < bounds.right
            let verticalCheck = top > bounds.top && bottom < bounds.bottom 

            if(horizontalCheck && verticalCheck){
                this.columns[this.type].classList.add('col-hl')

            } 
            else {
                this.columns[this.type].classList.remove('col-hl')

                // filter this.columns on only the keys that do not equal this.type
                const filteredByKey = Object.fromEntries(
                    Object.entries(this.columns).filter(([key, value]) => key !== this.type)
                )

                // loop over object: filteredByKey to obtain rect bounds
                for(let column in filteredByKey){

                    // define other bounds Object
                    let otherBounds = filteredByKey[column].getClientRects()[0];

                    // check if there are otherbounds - if not return
                    if(!otherBounds) break;

                    // compare horizontal and vertical other bounds to instance position
                    let horizontalCheckOtherBounds = left > otherBounds.left && right < otherBounds.right
                    let verticalCheckOtherBounds = top > otherBounds.top && bottom < otherBounds.bottom

                    // on check when instance in other bounds show red background
                    if(horizontalCheckOtherBounds && verticalCheckOtherBounds ){
                        // this.columns[column].style.border = "2px solid transparent"
                        // this.columns[column].style.cssText = "border:2px solid transparent;border-top:2px solid #124191;"
                        this.columns[column].classList.remove('col-hl');
                    } 
                    else {
                        // this.columns[column].style.border = "2px solid transparent"
                        // this.columns[column].style.cssText = "border:2px solid transparent;border-top:2px solid #124191;"
                        this.columns[column].classList.remove('col-hl');
                    }
                }
            }

            return horizontalCheck && verticalCheck
        }
    },
}
</script>

<style lang="scss" scoped>
    .clone{
        opacity:0.5;
        background-color: grey;
        border: 1px solid black;
        list-style: none;
        padding: 5px;
        margin: 5px;
    }
</style>
