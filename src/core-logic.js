import settings from "./settings.js"

export function checkAdjacing(newObj, prevObj, path) {

    let rowDiff = newObj.data.coords.row - prevObj.data.coords.row
    let colDiff = newObj.data.coords.col - prevObj.data.coords.col

    if(path.length){
        newObj.adjacingDirection = [rowDiff, colDiff]
    }

    if(!(Math.abs(rowDiff) > 1 || Math.abs(colDiff) > 1)){
        return true
    }

    return false
}

export function returnColorsArray(variety){

    if(variety === 'one'){
        return ['yellow'] 
    }

    if(variety === 'three'){
        return ['red', 'green', 'blue'] 
    }

    return
}

export function getRandomBlocks(amount, hGridSize, vGridSize){

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max)
    }

    let blocks = []

    for(let i = 0; i < amount; i++){

        let random = {
            row: getRandomInt(vGridSize),
            col: getRandomInt(hGridSize)
        }

        let { row, col } = random

        blocks.push([row,col])
    }

    return blocks

}

export function oppositeVector(vector){
    return [vector[0] * -1, vector[1] * -1]
}

// CONNECTORS
export function getConnectorDirections(baseStyle){

    let { CELL_SIZE_VMIN, GAP_SIZE_VMIN, CONNECTOR_THICKNESS } = settings

    return {
        down: {
            vector: [1,0],
            style: {
                ...baseStyle,
                transform: `translateY(${CELL_SIZE_VMIN + GAP_SIZE_VMIN}vmin) translateX(${CELL_SIZE_VMIN}vmin) translate(-50%,-50%) scaleY(1)`, 
                transformOrigin: 'top', width: `${CONNECTOR_THICKNESS}vmin`, 
                height: `${CELL_SIZE_VMIN + GAP_SIZE_VMIN}vmin`,
            }
        },

        up: {
            vector: [-1,0],
            style: {
                ...baseStyle,  
                transform: `translateY(${CELL_SIZE_VMIN + GAP_SIZE_VMIN}vmin) translateX(${CELL_SIZE_VMIN}vmin) translate(-50%,-50%) scaleY(-1)`, 
                transformOrigin: 'top', width: `${CONNECTOR_THICKNESS}vmin`, 
                height: `${CELL_SIZE_VMIN + GAP_SIZE_VMIN}vmin`,
            }
        },

        left: {
            vector: [0,-1],
            style: {
                ...baseStyle, 
                transform: `translateY(${CELL_SIZE_VMIN / 2}vmin) translateX(${CELL_SIZE_VMIN / 2}vmin) translate(-50%,-50%) scaleX(1)`,
                transformOrigin: 'right', 
                width: `${CELL_SIZE_VMIN + GAP_SIZE_VMIN}vmin`, 
                height: `${CONNECTOR_THICKNESS}vmin`, 
            }
        },

        right: {
            vector: [0,1],
            style: {
                ...baseStyle, 
                transform: `translateY(${CELL_SIZE_VMIN / 2}vmin) translateX(${CELL_SIZE_VMIN / 2}vmin) translate(-50%,-50%) scaleX(-1)`, 
                transformOrigin: 'right', 
                width: `${CELL_SIZE_VMIN + GAP_SIZE_VMIN}vmin`, 
                height: `${CONNECTOR_THICKNESS}vmin` 
            }
        },

        downRight: {
            vector: [1,1],
            style: {
                ...baseStyle,
                transform: `translateY(${CELL_SIZE_VMIN / 2}vmin) translateX(${CELL_SIZE_VMIN / 2}vmin) translate(-70%,-50%) scaleX(-1) rotate(-45deg)`,
                transformOrigin: 'right',
                width: `${Math.sqrt(Math.pow(CELL_SIZE_VMIN, 2) + Math.pow(CELL_SIZE_VMIN, 2)) + Math.sqrt(Math.pow(GAP_SIZE_VMIN, 2) + Math.pow(GAP_SIZE_VMIN, 2))}vmin`,
                height: `${CONNECTOR_THICKNESS}vmin`, 
            }
        },

        downLeft: {
            vector: [1,-1],
            style: {
                ...baseStyle,
                transform: `translateY(${CELL_SIZE_VMIN / 2}vmin) translateX(${CELL_SIZE_VMIN / 2}vmin) translate(-70%,-50%) scaleX(-1) rotate(-135deg)`,
                transformOrigin: 'right',
                width: `${Math.sqrt(Math.pow(CELL_SIZE_VMIN, 2) + Math.pow(CELL_SIZE_VMIN, 2)) + Math.sqrt(Math.pow(GAP_SIZE_VMIN, 2) + Math.pow(GAP_SIZE_VMIN, 2))}vmin`,
                height: `${CONNECTOR_THICKNESS}vmin`,
            }
        },

        upRight: {
            vector: [-1,1],
            style: {
                ...baseStyle,
                transform: `translateY(${CELL_SIZE_VMIN / 2}vmin) translateX(${CELL_SIZE_VMIN / 2}vmin) translate(-70%,-50%) scaleX(-1) rotate(45deg)`,
                transformOrigin: 'right',
                width: `${Math.sqrt(Math.pow(CELL_SIZE_VMIN, 2) + Math.pow(CELL_SIZE_VMIN, 2)) + Math.sqrt(Math.pow(GAP_SIZE_VMIN, 2) + Math.pow(GAP_SIZE_VMIN, 2))}vmin`,
                height: `${CONNECTOR_THICKNESS}vmin`,  
            }
        },

        upLeft: {
            vector: [-1,-1],
            style: {
                ...baseStyle,
                transform: `translateY(${CELL_SIZE_VMIN / 2}vmin) translateX(${CELL_SIZE_VMIN / 2}vmin) translate(-70%,-50%) scaleX(-1) rotate(135deg)`,
                transformOrigin: 'right',
                width: `${Math.sqrt(Math.pow(CELL_SIZE_VMIN, 2) + Math.pow(CELL_SIZE_VMIN, 2)) + Math.sqrt(Math.pow(GAP_SIZE_VMIN, 2) + Math.pow(GAP_SIZE_VMIN, 2))}vmin`,
                height: `${CONNECTOR_THICKNESS}vmin`,
            }
        },
    }
}
