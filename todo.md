## trial game
## TWO DOTS
## the length of connected dots equals point count: 2 dots 2, 10 dots 10 etc. 

## Concept
Swipe away a minimum of 3 of the same color balls. After swipe they dissapear and empty places will be filled up by newly spawned balls

state 1:

+-------------------+
| R | G | B | R | G |
| B | R | G | R | B |
| R | G | R | B | B |
| R | R | G | B | R |
+-------------------+

state: 2
+-------------------+
| R | G | B | R | G |
| B | R | G | R | B |
| R | G | R | # | # |
| R | R | G | # | R |
+-------------------+

STATE: 3 ($ = newly spawned )
+-------------------+
| R | G | B | $ | $ |
| B | R | G | $ | G |
| R | G | R | R | B |
| R | R | G | R | R |
+-------------------+

## swipe
  +-----------+
  | 1 | 2 | 3 |
  +-----------+
1 | B | R | R | 
2 | B | B | R |
3 | R | B | R | 
  +-----------+

## logic X-axis
[0] [1] [2]
[(B)] [R] [R]
[R] [(B)] [R]
[R] [R] [(B)]

if B X-position is first cell (x = 0) => possibleTwins on: [x1, x2]
if B X-position is second cell (x = 1) => possibleTwins on: [x0, x2]
if B X-position is third cell (x = 2) => possibleTwins on: [x0, x1]   

## logic axis
0 1 2
3 4 5
6 7 8

## direction vector
[1,-1][-1,0][-1,1]
[0,-1][0,0][0,1]
[1,-1][1,0][1,1]

== Connect through is any neighbor has same color up towards neighbour

B R B
G R G
B R G

## bounds [ROW, COLUMN] => [x,y] (1 = down | right, -1 is up | left)
[first, first] => ![-1,0 | 0,-1]
[first, n] => ![0,-1]
[first, last] => ![1,0 | 0, -1]

[n, first] => ![-1,0]
[n,n] => ![]
[n, last] => ![1,0]

[last, first] => ![-1,0 | 1, 0]
[last, n] => ![1,0]
[last, last] => ![1,0 | 1,0]

## logic
On click check:
    - click is in bounds of a specific cell
    - add to query 



## backup function

const outputPossibleDirections = (row, col, maxRows, maxCols) => {

    // set indicator obj

    const INDICATOR_VALUES = {
        FIRST: 'first',
        BETWEEN: 'n',
        LAST: 'last'
    }

    let indicator = {
        row: undefined,
        col: undefined
    }

    if(row === 0){
        indicator.row = INDICATOR_VALUES.FIRST
    }

    if(row > 0 && row < maxRows - 1){
        indicator.row = INDICATOR_VALUES.BETWEEN
    }

    if(row === maxRows - 1){
        indicator.row = INDICATOR_VALUES.LAST
    }

    if(col === 0){
        indicator.col = INDICATOR_VALUES.FIRST
    }

    if(col > 0 && col < maxCols - 1){
        indicator.col = INDICATOR_VALUES.BETWEEN
    }

    if(col === maxCols - 1){
        indicator.col = INDICATOR_VALUES.LAST
    }

    // define possible directions

    if(indicator.row === INDICATOR_VALUES.FIRST && indicator.col === INDICATOR_VALUES.FIRST){
        // X-Y => [1,0], [0,1], [1,1]
    }

    if(indicator.row === INDICATOR_VALUES.LAST && indicator.col === INDICATOR_VALUES.LAST){
        // X-Y => [-1,0] [-1,-1] [0,-1]
    }
}













