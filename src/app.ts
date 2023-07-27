// import {program} from 'commander'
// import * as fs from 'fs'
import * as dotenv from 'dotenv'
import chalk from 'chalk'
import * as blessed from "blessed"
import * as log from './console-logger'
import { M } from 'vite-node/types-63205a44'

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

// y, x indexed grid of rows of characters
// type MapGrid = MapRow[]
type Point = {x: number, y: number}
type Room = {origin: Point, width: number, height: number}
type RoomList = Room[]
type MapRow = string[]

interface IncompleteGameMap extends Array<MapRow>{
  [index: number]: MapRow;
  rooms?: RoomList; 
}

interface GameMap extends IncompleteGameMap {
  rooms: RoomList; 
}

// functions 
function generateGrid(): GameMap {
  const grid : IncompleteGameMap = Array(HEIGHT).fill(' ').map(() => Array(WIDTH).fill(CHARS.stone_wall))
  grid.toString = () => grid.map(row => row.join('')).join('\n')
  grid.rooms = []
  return grid as GameMap
}

function addRooms(grid: GameMap, i: number = 10): void {
  grid.rooms = []
  for(i=0; i<10; i++){
    let room: Room = planRoom(mapGrid);
    grid.rooms.push(room)
    carveRoom(room, mapGrid)
  }  
}

function carveRoom(room: Room, mapGrid: GameMap): void {
  for(let y = room.origin.y; y < room.origin.y + room.height; y++){
    for(let x = room.origin.x; x < room.origin.x + room.width; x++){
      mapGrid[y][x] = CHARS.stone_floor
    }
  }
}

function rnd(max: number): number {
  return Math.floor(Math.random() * max)
}

// get all the points in a room
// also include the "walls" surrounding the room
// to ensure no collisions with other rooms
function getPointsInRoom(room: Room): Point[] {
  let points: Point[] = []
  let k = 2 // buffer for bordering cells
  for(let y = room.origin.y - k; y < room.origin.y + room.height + (2*k); y++){ // buffer for bordering cells
    for(let x = room.origin.x - k; x < room.origin.x + room.width + (2*k); x++){ // buffer for bordering cells
      points.push({x:x, y:y})
    }
  }
  return points
}

function validateRoom (room: Room, map: GameMap): boolean {
  // guard vs a room extending out of bounds
  if (room.origin.x + room.width > WIDTH || 
      room.origin.y + room.height > HEIGHT) return false 
  
      // guard vs overlap
  if (map.rooms.some(r => 
    r.origin.x < (room.origin.x + room.width + 2) &&
    (r.origin.x + r.width + 2) > room.origin.x &&
    r.origin.y < (room.origin.y + room.height + 2) &&
    (r.origin.y + r.height + 2) > room.origin.y)) return false
  else return true 
}

function planRoom(map: GameMap): Room {
  let w,h: number
  let room: Room
  do {
    w = rnd(30) + 5
    h = rnd(30) + 5 
    room = {origin:{x: rnd(WIDTH), y: rnd(HEIGHT)}, width: w, height: h}
  } while(!validateRoom(room, map))

  return(room)
}

function addHallways(map: GameMap):void {
  // duplicate grid.rooms so we can mutate it
  let unconnectedRooms = map.rooms.slice(0)
  let connectedRooms: RoomList = []
  while (unconnectedRooms.length > 0) {
    let room: Room = (unconnectedRooms.pop() as Room)
    let closestRoom = findClosestRoom(room, unconnectedRooms)
    if(closestRoom) {
      connectRooms(room, closestRoom, map)
      connectedRooms.push(room, closestRoom)
    }
  }
}

function connectRooms(roomA: Room, roomB: Room, map: GameMap): void {
  // find the center of each room
  let centerA = {x: roomA.origin.x + Math.floor(roomA.width/2), y: roomA.origin.y + Math.floor(roomA.height/2)}
  let centerB = {x: roomB.origin.x + Math.floor(roomB.width/2), y: roomB.origin.y + Math.floor(roomB.height/2)}
  // then draw a line between them
  let x = centerA.x
  let y = centerA.y
  while(x != centerB.x){
    map[y][x] = CHARS.stone_floor
    x += (x < centerB.x) ? 1 : -1
  }
  while(y != centerB.y){
    map[y][x] = CHARS.stone_floor
    y += (y < centerB.y) ? 1 : -1
  }
}

function getDistance(roomA: Room, roomB: Room): number {
  let centerA = {x: roomA.origin.x + Math.floor(roomA.width/2), y: roomA.origin.y + Math.floor(roomA.height/2)}
  let centerB = {x: roomB.origin.x + Math.floor(roomB.width/2), y: roomB.origin.y + Math.floor(roomB.height/2)}
  return Math.sqrt(Math.pow(centerA.x-centerB.x, 2) + Math.pow(centerA.y-centerB.y, 2))
}

function findClosestRoom(room: Room, rooms: RoomList): Room | undefined {
  let closestRoom: Room | undefined
  let closestDistance = Infinity
  for(let i=0; i<rooms.length; i++){
    let distance = getDistance(room, rooms[i])
    if(distance < closestDistance){
      closestRoom = rooms[i]
      closestDistance = distance
    }
  }
  return closestRoom
}

// 

const mapGrid = generateGrid()
addRooms(mapGrid)

addHallways(mapGrid)
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



