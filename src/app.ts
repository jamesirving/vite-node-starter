// import {program} from 'commander'
// import * as fs from 'fs'
import * as dotenv from 'dotenv'
import chalk from 'chalk'
import * as blessed from "blessed"
import * as log from './console-logger'

dotenv.config({path: '.env'})
log.info(chalk.blue('Hello world'))

const WIDTH = 120
const HEIGHT = 80
const CHARS = {
  stone_floor: '.',
  stone_wall:  '#',
  water:       '~',
  person:      '@',
  bat:         'b',
  snake:       's',
  rat:         'r',
  chest:       'n',
  item:        'i',
}

// y, x
function generateGrid(): string[][] {
  const grid : string[][]  = Array(HEIGHT).fill(' ').map(() => Array(WIDTH).fill(CHARS.stone_floor))
  grid.toString = () => grid.map(row => row.join('')).join('\n')
  return grid
}

const mapGrid = generateGrid()

//
//
//

const screen = blessed.screen({
  smartCSR: true
})

screen.title = 'best title'

screen.key(["q", "C-c"], () => {
  screen.destroy()
  process.exit(0) 
})

const box = blessed.box({
  top: 'center',
  left: 'center',
  width: WIDTH+2,
  height: HEIGHT+2,
  content: mapGrid.toString(),
  tags: true,
  mouse: false,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
    hover: {
      bg: 'green'
    }
  }
})

screen.append(box)
screen.render()

//
//
//



