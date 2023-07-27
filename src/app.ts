// import {program} from 'commander'
// import * as fs from 'fs'
import * as dotenv from 'dotenv'
import chalk from 'chalk'
import * as blessed from "blessed"
import * as log from './console-logger'

dotenv.config({path: '.env'})
log.info(chalk.blue('Hello world'))

// y, x
function generateGrid(): string[][] {
  const grid : string[][]  = Array(height).fill(' ').map(() => 
    Array(width).fill(' ').map(() => randomAsciiChar()
  ))
  grid.toString = () => gridToString(grid)
  return grid
}

function gridToString(grid: string[][]): string {
  return grid.map(row => row.join('')).join('\n')
}

const characters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!@#$%^&*(:;'"\\|)}]{[<>/-_=+\`~`.split('');
const width = 120
const height = 80

function randomAsciiChar(): string {
  const i = (Math.random() * characters.length) | 0
  return characters[i]
}

const grid = generateGrid()

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
  width: 120+2,
  height: 80+2,
  content: grid.toString(),
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



