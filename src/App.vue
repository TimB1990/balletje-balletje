<script setup>

import { onMounted, ref, computed } from 'vue';
import _ from 'lodash';
import { generate } from '@vue/compiler-core';

const DEBUG = true

// VARIABLES
let gameboard = ref([])
let connectors = ref([])
let vGridSize = ref(5)
let hGridSize = ref(5)
let cellSize = ref(10)
let cellGap = ref(2)
let path = ref([])
let score = ref(0)
let mouseMoveThrottle = null;
let debugMessage = ref('');
let strike = ref(0)
let strikedIds = ref([]);
let allCoords = ref([])


// COLOR VARIETY - VARIABLES

let colorVariety = DEBUG ? ref("one") : ref("six")

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

const generateBall = (x, y) => {

    let position = {
        top: y * ( cellSize.value + cellGap.value ) + cellGap,
        left: x * ( cellSize.value + cellGap.value ) + cellGap
    }

    return {
        id: Math.random().toString(36).slice(2, 10),
        data: {
            coords: {row: y, col: x},
            adjacingDirection: [0,0],
        },
        hidden: false,
        dynamic: false,
        position,
        style: {
            backgroundColor: _.sample(returnColorsArray()),
        }
    }
}

const populateGameboard = () => {

    console.log('populate board')

    let board = []

    for(let y = 0; y < vGridSize.value; y++){
        for(let x = 0; x < hGridSize.value; x++){
            board.push(generateBall(x, y));
        }
    }

    allCoords.value = board.map(entry => JSON.stringify(entry.data.coords))

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
}

function processStrike(){

    gameboard.value.forEach(entry => entry.dynamic = false)

    if(path.value.length){

        // find out which balls are on top of striked ball

        defineStackAndDropNewBalls()
        path.value = []
        score.value += strike.value + 1
        strikedIds.value = []
        strike.value = 0
    }
}

function defineStackAndDropNewBalls(){

    const sortedPath = path.value.sort((a, b) => {
        return a.data.coords.row < b.data.coords.row ? 1 : -1 
    })

    let cols = []

    sortedPath.forEach(p => {

        // find gameboard entry
        let entry = gameboard.value.find(entry => entry.data.coords.row === p.data.coords.row && entry.data.coords.col === p.data.coords.col)
        
        if(!entry) return

        cols.push(p.data.coords.col)

    })

    for(let col = 0; col < hGridSize.value; col++){

        for(let row = vGridSize.value; row >= 0; row--){

            let current = gameboard.value.find(g => g.data.coords.row === row && g.data.coords.col === col)

            let inPath = sortedPath.find(p => p === current)
            
            if(!inPath && !current?.target) continue;

            for(let up = row - 1; up >= -vGridSize.value; up--){

                let current = gameboard.value.find(g => g.data.coords.row === up && g.data.coords.col === col)

                if (up < 0) {
                    // console.log('create ball at and assign target for', up, row)
                    let newBall = generateBall(col, up - vGridSize.value)
                    gameboard.value.push(newBall)
                    newBall.dynamic = true
                    newBall.target = row
                    break;
                } 

                let currentInPath = sortedPath.find(p => p === current)

                if(currentInPath || current.target !== undefined ) continue;

                current.target = row
                break;

            }
        }
    }

    gameboard.value = gameboard.value.filter(entry => !sortedPath.map(s => s.id).includes(entry.id))

    gameboard.value.forEach(entry => {
        if(entry.target === undefined) return
        setTimeout(() => {
            entry.dynamic = true
            entry.data.coords.row = entry.target
            entry.target = undefined
        }, 50)
    })
}

function checkAdjacing(newObj, prevObj) {

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
const onMouseDown = (e) => {

    if(!e.target.closest("#gameboard")) return

    let board = document.querySelector("#gameboard")
    board.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
}

const onMouseUp = () => {

    let board = document.querySelector("#gameboard")

    board.removeEventListener("mousemove", onMouseMove)
    board.removeEventListener("mousedown", onMouseDown)

    processStrike()

    path.value = []
    strikedIds = []
    
}

const onMouseMove = (e) => {

    let board = document.querySelector("#gameboard")
    board.removeEventListener("mousedown", onMouseDown)

    let element = e.target.closest('.ball')

    if(!element) return

    let dataId = element.getAttribute("data-id")

    let obj = gameboard.value.find((entry) => {
        return entry.id === dataId
    })

    handleCellDrag(obj)
}

// COMPUTED
const gameboardLayout = computed(() => {
    return {
        display: 'grid',
        gridTemplateRows: `repeat(${vGridSize.value}, ${cellSize.value}vmin)`,
        gridTemplateColumns: `repeat(${hGridSize.value}, ${cellSize.value}vmin)`,
        gap: `${cellGap.value}vmin`
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

    <div @mousedown="onMouseDown" id="gameboard" :style="gameboardLayout">

        <div class="debugger">
            <div class="debug-info">
                <code>Score: {{ score }}</code>
                <code>Strike: {{ strike }}</code>
                <code>msg: {{ debugMessage }}</code>
                <code>Colors: {{ colorVariety }}</code>
            </div>

            <div class="option-fields">
                <label for="rowCount">Rows:</label>
                <input @change="reset" v-model="vGridSize" id="rowCount" type="number" min="4" max="12">
                <label for="colCount">Columns:</label>
                <input @change="reset" v-model="hGridSize" id="colCount" type="number" min="4" max="12">

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
        <!-- :style="obj.style" -->
        <div v-for="(obj, index) in gameboard" 
            :data-id="obj.id"
            :key="obj.id"
            class="ball"
            :style="{
                top: ((obj.data.coords.row * ( cellSize + cellGap )) + cellGap)+'vmin',
                left: ((obj.data.coords.col * ( cellSize + cellGap )) + cellGap)+'vmin',
                background: `radial-gradient(circle at 15px 15px, ${obj.style.backgroundColor}, #000)`,
                width: `${cellSize}vmin`,
                height: `${cellSize}vmin`,
                // opacity: obj.hidden ? 0 : 1,
                transition: obj.dynamic ? `top ${0.5}s ease-in` : 'none',
            }"
            >
            <span class="index">{{ [ obj.data.coords.row, obj.data.coords.col ]}} | {{ obj.target }}</span>
        </div>

        <!-- connecteuren -->
        <div v-for="(connector) in connectors" class="connector-wrapper">
            <div 
                v-for="direction in connector.directions" 
                v-show="connectors.length > 0 && coordsInPath([connector.data.row, connector.data.col]) && coordsInPath([connector.data.row, connector.data.col]).dir && coordsInPath([connector.data.row, connector.data.col]).dir.toString() === oppositeVector(direction.vector).toString()" 
                :style="direction.style" class="connector">
            </div>
            
        </div>
    </div>
</template>