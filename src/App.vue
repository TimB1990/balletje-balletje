<script setup>

import { onMounted, ref, computed } from 'vue';
import _ from 'lodash';
import settings from "./settings.js"
import { checkAdjacing, returnColorsArray, getRandomBlocks } from "./core-logic.js"

// VARIABLES
// dimensions
let vGridSize = ref(settings.V_GRID_SIZE)
let hGridSize = ref(settings.H_GRID_SIZE)
let cellSize = ref(settings.CELL_SIZE_VMIN)
let cellGap = ref(settings.GAP_SIZE_VMIN)

// data holders
let gameboard = ref([])
let path = ref([])
let score = ref(0)
let strike = ref(0)
let strikedIds = ref([]);
let allCoords = ref([])
let blocks = getRandomBlocks(settings.BLOCK_AMOUNT, settings.H_GRID_SIZE, settings.V_GRID_SIZE)
let colorVariety = settings.DEBUG ? ref("one") : ref("three")
let strikesMade = ref(0)
let avgScore = ref(0)
let connectors = ref([])

onMounted(() => {
    reset()
})

function reset() {

    gameboard.value = []
    score.value = 0
    strike.value = 0
    strikedIds.value = []
    path.value = []
    gameboard.value = populateGameboard()
}

function generateBall(x, y) {

    let position = {
        top: y * (cellSize.value + cellGap.value) + cellGap.value,
        left: x * (cellSize.value + cellGap.value) + cellGap.value
    }

    return {
        id: Math.random().toString(36).slice(2, 10),
        data: {
            coords: { row: y, col: x },
            adjacingDirection: [0, 0],
        },
        dynamic: false,
        position,
        style: {
            backgroundColor: _.sample(returnColorsArray(colorVariety.value)),
        }
    }
}

function populateGameboard() {

    let board = []

    for (let y = 0; y < vGridSize.value; y++) {
        for (let x = 0; x < hGridSize.value; x++) {

            allCoords.value.push([y, x])

            if (blocks.find(b => b[0] === y && b[1] === x)) continue;

            board.push(generateBall(x, y));
        }
    }

    return board
}

function generateConnector(startCoords, endCoords) {

    const direction = {
        y: endCoords.row - startCoords.row,
        x: endCoords.col - startCoords.col
    }

    const gameBoardElement = document.getElementById('gameboard');

    let connectorElement = document.createElement('div');

    connectorElement.setAttribute('id', `connector-${connectors.value.length}`)

    function css(element, style) {
        for (const property in style) {
            element.style[property] = style[property]
        }
    }

    css(connectorElement, {
        'position': 'absolute',
        'background-color': 'black',
        'width': '10px',
    })

    gameBoardElement.appendChild(connectorElement);

    let rotation = 0;
    let offsetX = 0;
    let offsetY = 0;
    let height = 0;

    let cellSizeGap = (cellSize.value + cellGap.value);

    let { x, y } = direction;

    if (y === 1 && x === 0) {
        rotation = 0
        offsetY = (cellSize.value / 2 - (cellGap.value / 2)) * -1
        offsetX = (cellSize.value / 2) - (cellGap.value / 2)
        height = cellSize.value + cellGap.value + 'vmin'
    }
    else if (y === 1 && x === 1) {
        rotation = 135
        offsetY = (cellSize.value / 2) * -1 + (cellGap.value)
        offsetX = (cellSize.value / 2) + (2.5 * cellGap.value) + cellGap.value / 2
        height = Math.sqrt(Math.pow(cellSizeGap, 2) + Math.pow(cellSizeGap, 2)) + 'vmin'
    }
    else if (y === 0 && x === 1) {
        rotation = 90
        offsetY = cellGap.value / 2
        offsetX = cellSize.value
        height = cellSize.value + cellGap.value + 'vmin'
    }
    else if (y === -1 && x === 1) {
        rotation = 45
        offsetY = (cellSize.value / 2) + cellGap.value * 2
        offsetX = (cellSize.value / 2) + (2.5 * cellGap.value)
        height = Math.sqrt(Math.pow(cellSizeGap, 2) + Math.pow(cellSizeGap, 2)) + 'vmin'

    }
    else if (y === -1 && x === 0) {
        rotation = 180
        offsetY = cellSize.value / 2 + cellGap.value,
            offsetX = (cellSize.value / 2) - (cellGap.value / 2)
        height = cellSize.value + cellGap.value + 'vmin'
    }
    else if (y === -1 && x === -1) {
        rotation = -45
        offsetY = cellSize.value / 2 + cellGap.value * 2;
        height = Math.sqrt(Math.pow(cellSizeGap, 2) + Math.pow(cellSizeGap, 2)) + 'vmin'
    }
    else if (y === 0 && x === -1) {
        rotation = -90
        offsetY = (cellGap.value / 2)
        height = cellSize.value + cellGap.value + 'vmin'
    }
    else if (y === 1 && x === -1) {
        rotation = -135
        offsetY = (cellSize.value / 2) * -1 + (cellGap.value * 1.5)
        offsetX = (cellGap.value) * -1;
        height = Math.sqrt(Math.pow(cellSizeGap, 2) + Math.pow(cellSizeGap, 2)) + 'vmin'
    }

    css(connectorElement, {
        'left': startCoords.col * (cellSize.value + cellGap.value) + cellGap.value + offsetX + 'vmin',
        'top': startCoords.row * (cellSize.value + cellGap.value) + cellGap.value - offsetY + 'vmin',
        'transform': `rotate(${rotation}deg)`,
        'height': height,
        'z-index': '5'
    })

    connectors.value.push(connectorElement);

}

function handleCellDrag(obj) {

    if (!path.value.length) {
        strike.value = 0
        path.value.push(obj)
        return
    }

    const previousobj = path.value[path.value.length - 1]

    if (path.value.includes(obj)) {

        if (previousobj.id !== obj.id) {

            let touchedIndex = path.value.indexOf(previousobj)
            for (let i = touchedIndex; i < path.value.length; i++) {
                path.value.splice(i, 1);
            }

            strike.value -= 1

            let lastConnectorId = connectors.value.pop().id

            let lastConnector = document.getElementById(lastConnectorId)
            lastConnector.parentNode.removeChild(lastConnector)
        }

        return

    }

    const colormatch = obj.style.backgroundColor === previousobj.style.backgroundColor
    const adjacing = checkAdjacing(obj, previousobj, path.value)

    if (colormatch && adjacing) {
        path.value.push(obj)
        generateConnector(previousobj.data.coords, obj.data.coords)
        strike.value += 1
        return
    }
}

function removeConnectors() {
    connectors.value.forEach((connector) => {
        const { id } = connector
        let connectorElement = document.getElementById(id)
        connectorElement.parentNode.removeChild(connectorElement)
    })

    connectors.value = []
}

function processStrike() {

    gameboard.value.forEach(entry => entry.dynamic = false)

    if (!(path.value.length >= settings.MIN_STRIKE_LENGTH)) {
        strike.value = 0;
        removeConnectors();
        path.value = []
        return
    }

    defineStackAndDropNewBalls()

    path.value = []
    score.value += strike.value
    document.querySelector(".score").classList.add('animate')
    strike.value = 0

    // remove connectors from DOM
    removeConnectors();

    setTimeout(() => {
        document.querySelector(".score").classList.remove('animate')
        strikesMade.value += 1
        let average = score.value / strikesMade.value
        avgScore.value = parseFloat(average.toFixed(1))

    }, 500)

}

function defineStackAndDropNewBalls() {

    const sortedPath = path.value.sort((a, b) => {
        return a.data.coords.row < b.data.coords.row ? 1 : -1
    })

    let cols = []

    sortedPath.forEach(p => {

        let entry = gameboard.value.find(entry => entry.data.coords.row === p.data.coords.row && entry.data.coords.col === p.data.coords.col)

        if (!entry) return

        cols.push(p.data.coords.col)

    })

    // loop over each column
    for (let col = 0; col < hGridSize.value; col++) {

        // loop over each row
        for (let row = vGridSize.value; row >= 0; row--) {

            //get current from gameboard having entry at row
            let current = gameboard.value.find(g => g.data.coords.row === row && g.data.coords.col === col)

            // check if current is inPath - striked away
            let inPath = sortedPath.find(p => p === current)

            // if not in path or current is either defined and has target go to next iteration - skip row
            if (!inPath && !current?.target) continue;

            // when current has no target defined or is in path, loop up to minus vGridsize (outside board)
            for (let up = row - 1; up >= -vGridSize.value; up--) {

                // find present ball in up loop
                let present = gameboard.value.find(g => g.data.coords.row === up && g.data.coords.col === col)

                // when loop exeeds row zero (goes outside board) generate a new ball
                if (up < 0) {
                    let newBall = generateBall(col, up - vGridSize.value)
                    gameboard.value.push(newBall)
                    newBall.dynamic = true
                    newBall.target = row
                    break;
                }

                // check if present is in path (is striked)
                let presentInPath = sortedPath.find(p => p === present)

                // if present in path - is striked, or present has target not undefined - skip iteration
                if (presentInPath || present?.target !== undefined) {
                    continue;
                }

                // if present evaluates undefined - skip iteration as wel
                if (!present) continue;

                // if present set target to row
                if (present) present.target = row

                // exit loop
                break;
            }
        }
    }

    gameboard.value = gameboard.value.filter(entry => !sortedPath.map(s => s.id).includes(entry.id))

    gameboard.value.forEach(entry => {
        if (entry.target === undefined) return
        setTimeout(() => {
            entry.dynamic = true
            entry.data.coords.row = entry.target
            entry.target = undefined
        }, 50)
    })
}

// GAME BOARD EVENT LISTENERS
function onMouseDown(e) {

    e.preventDefault()

    if (!e.target.closest("#gameboard")) return

    let board = document.querySelector("#gameboard")

    board.addEventListener("mousemove", onMouseMove)
    board.addEventListener("touchmove", onMouseMove)

    window.addEventListener("mouseup", onMouseUp)
    window.addEventListener("touchend", onMouseUp)

    window.addEventListener('touchcancel', onMouseUp)
}

function onMouseUp(e) {

    e.preventDefault()

    let board = document.querySelector("#gameboard")

    board.removeEventListener("mousemove", onMouseMove)
    board.removeEventListener("touchmove", onMouseMove)

    board.removeEventListener("mousedown", onMouseDown)
    window.removeEventListener("touchend", onMouseDown)

    processStrike()

    path.value = []

}

function onMouseMove(e) {

    e.preventDefault();

    let board = document.querySelector("#gameboard")
    let target = e.touches ? document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY) : e.target

    board.removeEventListener("mousedown", onMouseDown)
    board.removeEventListener("touchstart", onMouseDown)

    if (!target) return

    let element = target.closest('.ball')

    if (!element) return

    let dataId = element.getAttribute("data-id")

    let obj = gameboard.value.find((entry) => {
        return entry.id === dataId
    })

    handleCellDrag(obj)
}

// COORDS IN PATH
function coordsInPath(coords) {

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

// DYNAMIC STYLINGS
const gameboardLayout = computed(() => {
    return {
        display: 'grid',
        gridTemplateRows: `repeat(${vGridSize.value}, ${cellSize.value}vmin)`,
        gridTemplateColumns: `repeat(${hGridSize.value}, ${cellSize.value}vmin)`,
        gap: `${cellGap.value}vmin`
    }
})

</script>

<template>
    <div class="container">

        <div class="score-panel">
            <div class="content">
                <div class="section"><span class="score-label">SCORE:</span> <span class="score">{{ score }}</span>
                </div>
                <div class="section"><span class="strike-label">STRIKE: </span><span class="strike">{{ strike }}</span>
                </div>
            </div>
        </div>

        <div @touchstart="onMouseDown" @mousedown="onMouseDown" id="gameboard" :style="gameboardLayout">

            <!-- cells -->
            <div v-for="i in (vGridSize * hGridSize)" class="cell"></div>

            <!-- blocks -->
            <div class="block" v-for="coords in blocks" :key="coords" :style="{
                top: ((coords[0] * (cellSize + cellGap)) + cellGap) + 'vmin',
                left: ((coords[1] * (cellSize + cellGap)) + cellGap) + 'vmin',
                width: `${cellSize}vmin`,
                height: `${cellSize}vmin`,
            }"></div>

            <!-- balls -->
            <div v-for="(obj) in gameboard" :data-id="obj.id" :key="obj.id"
                :class="{ ball: true, striked: path.find(p => p.id === obj.id) }" :style="{
                    top: ((obj.data.coords.row * (cellSize + cellGap)) + cellGap) + 'vmin',
                    left: ((obj.data.coords.col * (cellSize + cellGap)) + cellGap) + 'vmin',
                    background: `radial-gradient(circle at 15px 15px, ${obj.style.backgroundColor}, #000)`,
                    width: `${cellSize}vmin`,
                    height: `${cellSize}vmin`,
                    transition: obj.dynamic ? `top ${0.5}s ease-in` : 'none',
                }">
                <span v-show="path.find(p => p.id === obj.id)" class="inSelect"></span>
            </div>
        </div>

        <div class="results">
            <div class="content">
                <div class="strikes-made-wrapper">
                    <span class="strikes-label">STRIKES:</span>
                    <span class="strikes-value">{{ strikesMade }}</span>
                </div>
                <div class="avg-score-wrapper">
                    <span class="avg-label">AVARAGE PER STRIKE:</span>
                    <span class="avg-value">{{ avgScore }}</span>
                </div>
            </div>
        </div>
    </div>
</template>



