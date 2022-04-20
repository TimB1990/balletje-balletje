<script setup>

import { onMounted, ref, computed } from 'vue';
import _ from 'lodash';

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

const generateBall = (x, y, cellSize, cellGap ) => {

    let position = {
        top: y * ( cellSize + cellGap ) + cellGap,
        left: x * ( cellSize + cellGap ) + cellGap
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
            board.push(generateBall(x, y, cellSize.value, cellGap.value));
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

    // TODO DEBUG IMPROVE

    if (!path.value.length) {
        path.value.push(obj)
        strikedIds.value = path.value.map(entry => entry.id)
        debugMessage.value = `Clicked on ${obj.data.coords.col}, ${obj.data.coords.row}`
        return
    }

    if (path.value.includes(obj)) {
        debugMessage.value = `Already clicked on ${obj.data.coords.col}, ${obj.data.coords.row}`

        // let pathLength = path.value.length
        // path.value.splice(path.value[pathLength - 1], 1)

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
        score.value += strike.value + 1
        return
    }

    debugMessage.value = `incorrect dont do anyhting`

    processStrike()
}

function processStrike(){

    strike.value = 0

    gameboard.value.forEach(entry => entry.dynamic = false)

    let gameboardCopy = [...gameboard.value]
    
    if(strikedIds.value.length > 1 && path.value.length){

        gameboard.value = gameboard.value.filter(entry => !strikedIds.value.includes(entry.id))

        let strikedEntries = gameboardCopy.filter(entry => strikedIds.value.includes(entry.id))

        strikedEntries.forEach((striked) => {

            let currentRow = striked.data.coords.row

            let stackedEntries = []
            
            for(let i = currentRow; i >= 0; i--){
                
                let stacked = gameboard.value.find(entry => entry.data.coords.row === i && entry.data.coords.col === striked.data.coords.col)

                if(stacked !== undefined){
                    stacked.dynamic = true
                    stacked.data.coords.row += 1 
                }

                // which ballen are above me?
                stackedEntries.push(stacked)
            }
        })

        let gameboardCoords = gameboard.value.map(entry => JSON.stringify(entry.data.coords))

        let emptyCells = allCoords.value.filter(coord => !gameboardCoords.includes(coord))

        let ballQueue = []

        emptyCells.forEach((cell) => {

            let parsedCell = JSON.parse(cell)

            let pendingBall = generateBall(parsedCell.col, parsedCell.row - (vGridSize.value * 2), cellSize.value, cellGap.value)
            pendingBall.style.backgroundColor = "green";

            pendingBall.hidden = false
            ballQueue.push(pendingBall)
            gameboard.value.push(pendingBall)
        })

        // find balls with negative coords
        gameboard.value
            .filter(entry => entry.data.coords.row < 0)
            .forEach(entry => {
                setTimeout(() => {
                    entry.dynamic = true
                    entry.data.coords.row += vGridSize.value * 2
                }, 1000)
            }) 
    }
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
    // console.log('mousedown')
    let board = document.querySelector("#gameboard")
    board.addEventListener("mousemove", onMouseMove)
}

const onMouseUp = () => {
    // console.log('mouseup')
    let board = document.querySelector("#gameboard")

    board.removeEventListener("mousemove", onMouseMove)
    board.removeEventListener("mousedown", onMouseDown)

    // setTimeout(processStrike(), 50);
    processStrike()

    path.value = []
    strikedIds.value = 0
    strikedIds = []
    
}

const onMouseMove = (e) => {

    // console.log('mouse move')

    let board = document.querySelector("#gameboard")
    board.removeEventListener("mousedown", onMouseDown)

    if(mouseMoveThrottle === null)
    {
        mouseMoveThrottle = setTimeout(() => {

            //code
            if(e.target.closest(".ball")){
                let element = e.target.closest(".ball")
                let dataId = element.getAttribute("data-id")
                
                let obj = gameboard.value.find((entry) => {
                    return entry.id === dataId
                })

                handleCellDrag(obj)
            }

            mouseMoveThrottle = null;

        }, 50)
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
        <!-- :style="obj.style" -->
        <div v-for="(obj, index) in gameboard" 
            :data-id="obj.id" 
            class="ball"
            :style="{
                top: ((obj.data.coords.row * ( cellSize + cellGap )) + cellGap)+'vmin',
                left: ((obj.data.coords.col * ( cellSize + cellGap )) + cellGap)+'vmin',
                backgroundColor: obj.style.backgroundColor,
                width: `${cellSize}vmin`,
                height: `${cellSize}vmin`,
                opacity: obj.hidden ? 0 : 1,
                transition: obj.dynamic ? `top ${0.8}s ease-in` : 'none'
            }"
            >
            <span class="coords">[ {{ obj.data.coords.row}}, {{ obj.data.coords.col }}]</span>
            <span style="font-size:15px;color:white;">{{ index }}</span>
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