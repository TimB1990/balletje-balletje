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
let strike = ref(0)
let strikedIds = ref([]);

// COLOR VARIETY - VARIABLES

let colorVariety = ref("one")

// CORE
onMounted(() => {
    reset()
})

function returnColorsArray(){

    if(colorVariety.value === 'one'){
        return ['red'] 
    }

    if(colorVariety.value === 'three'){
        return ['red', 'green', 'blue'] 
    }

    if(colorVariety.value === 'six'){
        return ['red', 'green', 'blue', 'purple', 'yellow', 'orange'] 
    }

    if(colorVariety.value === 'nine'){
        return ['red', 'green', 'blue', 'purple', 'yellow', 'orange', 'magenta', 'cyan', 'pink'] 
    }

    if(colorVariety.value === 'twelve'){
        return ['red', 'green', 'blue', 'purple', 'yellow', 'orange', 'magenta', 'cyan', 'pink', 'brown', 'lime'] 
    }

    if(colorVariety.value === 'fifteen'){
        return ['red', 'green', 'blue', 'purple', 'yellow', 'orange', 'magenta', 'cyan', 'pink', 'brown', 'lime', 'indigo', 'mediumPurle', 'orangeRed'] 
    }

    return
}

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
                    height: `${cellSize + cellGap * 2 }vmin`
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

function reset(){

    gameboard.value = []
    connectors.value = []
    score.value = 0
    strike.value = 0
    strikedIds.value = []
    path.value = []

    gameboard.value = populateGameboard()
    connectors.value = populateConnectors()
}

const generateBall = (id, x, y, cellSize, cellGap ) => {

    let position = {
        top: y * ( cellSize + cellGap ) + cellGap,
        left: x * ( cellSize + cellGap ) + cellGap
    }

    return {
        id,
        data: {
            coords: {col: x, row: y},
            adjacingDirection: [0,0],
        },
        position,
        style: {
            top: `${position.top}vmin`,
            left: `${position.left}vmin`,
            backgroundColor: _.sample(returnColorsArray()),
            width: `${cellSize}vmin`,
            height: `${cellSize}vmin`
        }
    }
}

const populateGameboard = () => {

    let board = []

    for(let y = 0; y < vGridSize.value; y++){
        for(let x = 0; x < hGridSize.value; x++){
            board.push(generateBall(board.length + 1, x, y, cellSize.value, cellGap.value));
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

const handleCellDrag = (obj) => {

    if (!path.value.length) {
        path.value.push(obj)
        strikedIds.value = path.value.map(entry => entry.id)
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
        debugMessage.value = `add color ${obj.style.backgroundColor}`
        strikedIds.value.push(obj.id)
        strike.value += 1
        return
    }

    debugMessage.value = `incorrect dont do anyhting`

    processStrike()
}

function processStrike(){

    score.value += strike.value
    strike.value = 0

    let gameboardCopy = [...gameboard.value]
    
    if(strikedIds.value.length > 1 && path.value.length){

        for (let index = vGridSize.value; index >= 0; index--) {
            for (let index = hGridSize.value; index >= 0; index--) {

                // when empty after striked
                let strikedEntries = gameboardCopy.filter(entry => strikedIds.value.includes(entry.id))

                let coordsRowAbove = strikedEntries.map(entry => [entry.data.coords.row - 1, entry.data.coords.col])

                let entriesAbove = []

                coordsRowAbove.forEach((c) => {

                    // row = c[0], col = c[1]
                    let entry = gameboardCopy.find(obj => obj.data.coords.row === c[0] && obj.data.coords.col === c[1])

                    if(entry){
                        entriesAbove.push(entry)
                    }
                })

                console.log(entriesAbove)
            }
        }
    }

    path.value = []
    gameboard.value = gameboardCopy.filter(entry => !strikedIds.value.includes(entry.id))
    strikedIds.value = []

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

const oppositeVector = (vector) => {
    return [vector[0] * -1, vector[1] * -1]
}

// GAME BOARD EVENT LISTENERS
const onMouseDown = () => {
    let board = document.querySelector("#gameboard")
    board.addEventListener("mousemove", onMouseMove)
}

const onMouseUp = () => {
    let board = document.querySelector("#gameboard")
    board.removeEventListener("mousemove", onMouseMove)
    setTimeout(processStrike(), 200);
    
}

const onMouseMove = (e) => {

    if(mouseMoveThrottle === null)
    {
        mouseMoveThrottle = setTimeout(() => {

            //code
            if(e.target.closest(".ball")){
                let element = e.target.closest(".ball")
                let dataId = parseInt(element.getAttribute("data-id"))
                let obj = gameboard.value.find(entry => entry.id === dataId)
                handleCellDrag(obj)
            }

            mouseMoveThrottle = null;

        }, 100)
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

    return result[0]
}


</script>

<template>

    <div @mousedown="onMouseDown()" @mouseup="onMouseUp()" id="gameboard" :style="gameboardLayout">

        <div class="debugger">
            <div class="debug-info">
                <code>Score: {{ score }}</code>
                <code>Strike: {{ strike }}</code>
                <code>msg: {{ debugMessage }}</code>
                <code>striked: {{ strikedIds }}</code>
                <code>Colors: {{ colorVariety }}</code>
            </div>

            <div class="option-fields">
                <label for="rowCount">Rows:</label>
                <input @change="reset" v-model="vGridSize" id="rowCount" type="number" min="4" max="12">
                <label for="colCount">Columns:</label>
                <input @change="reset" v-model="hGridSize" id="colCount" type="number" min="4" max="12">

                <!-- color variants -->
                <label for="colorVariants">Color Variety:</label>
                <select @change="reset()" v-model="colorVariety" name="colorVariants" id="colorVariants">
                    <option value="one">single color - ONLY DEBUG</option>
                    <option value="three">3 colors</option>
                    <option value="six">6 colors</option>
                    <option value="nine">9 colors</option>
                    <option value="twelve">12 colors</option>
                    <option value="fifteen">15 colors</option>
                </select>
            </div>
        </div>

        <!-- cells -->
        <div v-for="i, in (vGridSize * hGridSize)" class="cell"></div>

        <!-- balls -->
        <div v-for="(obj, index) in gameboard" :data-id="obj.id" class="ball" :style="obj.style">
            <span class="coords">[ {{ obj.data.coords.row}}, {{ obj.data.coords.col }}]</span>
            <span class="number">{{ obj.id }}</span>
            <span style="font-size:15px;color:white;">{{ index }}</span>
        </div>

        <!-- connecteuren -->
        <div v-for="(connector,index) in connectors" class="connector-wrapper">
            <div 
                v-for="direction in connector.directions" 
                v-show="connectors.length > 0 && coordsInPath([connector.data.row, connector.data.col]) && coordsInPath([connector.data.row, connector.data.col]).dir && coordsInPath([connector.data.row, connector.data.col]).dir.toString() === oppositeVector(direction.vector).toString()" 
                :style="direction.style" class="connector">
            </div>
            
        </div>
    </div>
</template>

