<script setup>

import { onMounted, ref, computed } from 'vue';
import _ from 'lodash';

// VARIABLES
let gameboard = ref([])
let connectors = ref([])
let vGridSize = ref(4)
let hGridSize = ref(4)
let cellSize = ref(10)
let cellGap = ref(2)
let path = ref([])
let score = ref(0)
let mouseMoveThrottle = null;
let debugMessage = ref('');
let reactiveCoords = ref([0.0])
let vectors = ref([])

// CORE
onMounted(() => {
    gameboard.value = populateGameboard()
    connectors.value = populateConnectors()
})

// METHODS
const generateConnector = (x, y, cellSize, cellGap) => {

    const baseStyle = {
        top: `${y * ( cellSize + cellGap) + cellGap}vmin`,
        left: `${x * ( cellSize + cellGap) - (cellGap * 1.5)}vmin`,
        backgroundColor: "#000",
    }

    return {
       data: {
           row: y,
           col: x,
       },

       directions: {

            down: {
                vector: [1,0],
                style: {
                    ...baseStyle,  
                    transform: `translateY(${cellSize}vmin) translateX(${cellSize}vmin) translate(-50%,-50%) scaleY(1)`, 
                    transformOrigin: 'top', width: `${1}vmin`, 
                    height: `${cellSize + cellGap}vmin`
                }
            },

            up: {
                vector: [-1,0],
                style: {
                    ...baseStyle,  
                    transform: `translateY(${cellSize}vmin) translateX(${cellSize}vmin) translate(-50%,-50%) scaleY(-1)`, 
                    transformOrigin: 'top', width: `${1}vmin`, 
                    height: `${cellSize + cellGap}vmin`
                }
            },

            left: {
                vector: [0,-1],
                style: {
                    ...baseStyle, 
                    transform: `translateY(${cellSize / 2}vmin) translateX(${cellSize / 2}vmin) translate(-50%,-50%) scaleX(1)`, 
                    transformOrigin: 'right', 
                    width: `${cellSize + cellGap}vmin`, 
                    height: `${1}vmin` 
                }
            },

            right: {
                vector: [0,1],
                style: {
                    ...baseStyle, 
                    transform: `translateY(${cellSize / 2}vmin) translateX(${cellSize / 2}vmin) translate(-50%,-50%) scaleX(-1)`, 
                    transformOrigin: 'right', 
                    width: `${cellSize + cellGap}vmin`, 
                    height: `${1}vmin` 
                }
            },

            downRight: {
                vector: [1,1],
                style: {
                    ...baseStyle,
                    transform: `translateY(${cellSize / 2}vmin) translateX(${cellSize / 2}vmin) translate(-50%,-50%) scaleX(-1) rotate(-45deg)`,
                    transformOrigin: 'right',
                    width: `${cellSize + cellGap}vmin`,
                    height: `${1}vmin`,  
                }
            },

            downLeft: {
                vector: [1,-1],
                style: {
                    ...baseStyle,
                    transform: `translateY(${cellSize / 2}vmin) translateX(${cellSize / 2}vmin) translate(-50%,-50%) scaleX(-1) rotate(-135deg)`,
                    transformOrigin: 'right',
                    width: `${cellSize + cellGap}vmin`,
                    height: `${1}vmin`,
                }
            },

            upRight: {
                vector: [-1,1],
                style: {
                    ...baseStyle,
                    transform: `translateY(${cellSize / 2}vmin) translateX(${cellSize / 2}vmin) translate(-50%,-50%) scaleX(-1) rotate(45deg)`,
                    transformOrigin: 'right',
                    width: `${cellSize + cellGap}vmin`,
                    height: `${1}vmin`,  
                }
            },

            upLeft: {
                vector: [-1,-1],
                style: {
                    ...baseStyle,
                    transform: `translateY(${cellSize / 2}vmin) translateX(${cellSize / 2}vmin) translate(-50%,-50%) scaleX(-1) rotate(135deg)`,
                    transformOrigin: 'right',
                    width: `${cellSize + cellGap}vmin`,
                    height: `${1}vmin`,
                }
            },
       }
    }
}

const generateBall = (x, y, cellSize, cellGap ) => {

    return {
        data: {
            coords: {col: x, row: y},
            adjacingDirection: [0,0],
        },
        style: {
            top: `${y * ( cellSize + cellGap ) + cellGap}vmin`,
            left: `${x * ( cellSize + cellGap ) + cellGap}vmin`,
            backgroundColor: _.sample(['red', 'green', 'blue']),
            width: `${cellSize}vmin`,
            height: `${cellSize}vmin`
        }

    }
}

const populateGameboard = () => {

    let board = []

    for(let y = 0; y < vGridSize.value; y++){
        for(let x = 0; x < hGridSize.value; x++){
            board.push(generateBall(x, y, cellSize.value, cellGap.value));
        }
    }

    return board
}

const populateConnectors = () => {

    let connectors = []

    for(let y = 0; y < vGridSize.value; y++){
        for(let x = 0; x < hGridSize.value; x++){
            connectors.push(generateConnector(x, y, cellSize.value, cellGap.value));
        }
    }

    return connectors
}

const handleCellDrag = (obj, index ) => {

    if (!path.value.length) {
        path.value.push(obj)
        
        if(!vectors.value.includes(index)){
            vectors.value.push({
                index,
                dir: [0,0]
            })
        }

        debugMessage.value = `Clicked on ${obj.data.coords.col}, ${obj.data.coords.row}`
        return
    }

    if (path.value.includes(obj)) {
        debugMessage.value = `Already clicked on ${obj.data.coords.col}, ${obj.data.coords.row}`
        return
    }

    const previousobj = path.value[path.value.length - 1]
    const colormatch = obj.style.backgroundColor === previousobj.style.backgroundColor
    const adjacing = checkAdjacing(obj, previousobj)

    if (colormatch && adjacing) {
        path.value.push(obj)
        vectors.value.push({
            index,
            dir: obj.adjacingDirection
        });
        debugMessage.value = `add color ${obj.style.backgroundColor}`
        return
    }

    debugMessage.value = `incorrect dont do anyhting`
}

function checkAdjacing(newObj, prevObj) {
    // obv row en col distance check

    let rowDiff = newObj.data.coords.row - prevObj.data.coords.row
    let colDiff = newObj.data.coords.col - prevObj.data.coords.col

    if(path.value.length){
        newObj.adjacingDirection = [rowDiff, colDiff]
    }

    if(!(Math.abs(rowDiff) > 1 || Math.abs(colDiff) > 1)){
        return true
    }

    return false

}

const oppositeDirection = (entry) => {
    const [rowDiff, colDiff] = entry
    return [rowDiff * -1, colDiff * -1]
}

// GAME BOARD EVENT LISTENERS
const onMouseDown = () => {
    let board = document.querySelector("#gameboard")

    board.addEventListener("mousemove", onMouseMove)
}

const onMouseUp = () => {
    let board = document.querySelector("#gameboard")
    board.removeEventListener("mousemove", onMouseMove)
}

const onMouseMove = (e) => {

    if(mouseMoveThrottle === null)
    {
        mouseMoveThrottle = setTimeout(() => {

            //code
            if(e.target.closest(".ball")){
                let element = e.target.closest(".ball")
                let index = parseInt(element.getAttribute("data-index"))
                let obj = gameboard.value[index];
                handleCellDrag(obj, index)
                reactiveCoords.value = [obj.data.coords.row, obj.data.coords.col];
            }

            mouseMoveThrottle = null;

        }, 150)
    }
}

// COMPUTED
const gameboardLayout = computed(() => {
    return {
        display: 'grid',
        gridTemplateRows: `repeat(${vGridSize.value}, ${cellSize.value}vmin)`,
        gridTemplateColumns: `repeat(${hGridSize.value}, ${cellSize.value}vmin)`,
        gap: `${cellGap}vmin`
    }
})

// COORDS IN PATH FUNCTION
const coordsInPath = (coords) => {

    let data = path.value.map(entry => {
        return {
            coords: [entry.data.coords.row, entry.data.coords.col],
            dir: entry.adjacingDirection
        }
    })

    let result = data.filter(entry => {
        return entry.coords[0] === coords[0] && entry.coords[1] === coords[1]
    })

    return result.length > 0
}

</script>

<template>

    <div @mousedown="onMouseDown()" @mouseup="onMouseUp()" id="gameboard" :style="gameboardLayout">

        <div class="debugger">
            <code>vectors: {{ vectors }}</code>
        </div>

        <!-- cells -->
        <div v-for="i, in (vGridSize * hGridSize)" class="cell"></div>

        <!-- balls -->
        <div :data-index="index" v-for="(obj,index) in gameboard " class="ball" :style="obj.style">
            <span class="coords">[ {{ obj.data.coords.row}}, {{ obj.data.coords.col }}]</span>
            <span class="number">{{ index }}</span>
        </div>

        <!-- connecteuren -->
        <div v-for="connector in connectors" class="connector-wrapper">

            <div 
                v-for="direction in connector.directions" 
                v-show="coordsInPath([connector.data.row, connector.data.col])" :style="direction.style" class="connector">
            </div>
            
        </div>
    </div>
</template>