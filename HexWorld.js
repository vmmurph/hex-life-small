class Hex {
  constructor (world, xloc, yloc) {
    this.world = world
    this.xloc = xloc
    this.yloc = yloc
    this.key = `(${xloc},${yloc})`
    this.objs = []
  }

  getDrawX () {
    return this.yloc % 2 === 0 ? this.xloc : this.xloc + .5
  }

  getNeighbors () {
    return this.world.getNeighbors(this)
  }

  add (obj) {
    this.world.addObj.call(this.world, obj, this.xloc, this.yloc)
  }

  remove (key) {
    this.world.removeObj.call(this.world, key)
  }
}

class HexWorld {

  // number of objects (used to create unique keys)
  objCounter = 0
  // all objects being tracked
  allObjs = []
  // these are objects having step() called
  stepObjs = []
  // age of the world in steps
  age = 0

  constructor (width, height) {
    // width (in hexes) of the world
    this.width = width
    // height (in hexes) of the world
    this.height = height
    // 2 dimensional array of all hexes
    this.world = []
    // 1 dimensional array of all hexes
    this.flatWorld = []

    for (let x = 0; x < width; x++) {
      this.world[x] = []
      for (let y = 0; y < height; y++) {
        let t = new Hex(this, x, y)
        this.world[x][y] = t
        this.flatWorld.push(t)
      }
    }
  }

  getHex (x, y) {
    return this.world[x][y]
  }

  _getHexSafe (x, y) {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) return this.world[x][y]
    return null
  }

  // TODO: maybe fix for hexes?
  display () {
    let displayString = ''
    for (let y = 0; y < this.world[0].length; y++) {
      if (y % 2 === 1) displayString += '  '
      for (let x = 0; x < this.world.length; x++) {
        displayString += '/\u0305 \u0305 \\'
      }
      displayString += '\n'
      if (y % 2 === 1) displayString += '  '
      for (let x = 0; x < this.world.length; x++) {
        let hex = this.getHex(x, y)
        if (hex.objs[0])
          displayString += '\\' + hex.objs[0].asText() + '/'
        else
          displayString += '\\__/'
      }
      displayString += '\n'
    }
    console.log(displayString)
  }

  // TODO: rename timestep to step
  step () {
    this.stepObjs = []
    this.flatWorld.forEach(hex => {
      hex.objs.forEach(obj => {
        this.stepObjs.push(obj)
      })
    })
    this.stepObjs.forEach(obj => {
      obj.step()
    })
    this.age++
  }

  addObj (obj, x, y) {
    let hex = this.getHex(x, y)
    obj.hex = hex
    obj.key = this.getNewKey()
    
    hex.objs.push(obj)
    this.allObjs.push(obj)
    return obj
  }

  removeObj (key) {
    // remove from allObjs
    let index = this.allObjs.findIndex(e => e.key === key)
    let hex = null
    if (index != -1) {
      let arr = this.allObjs.splice(index, 1)
      hex = arr[0].hex
    }

    // remove from hex obj list
    index = hex.objs.findIndex(e => e.key === key)
    hex.objs.splice(index, 1)

    // remove from timeStepObjs
    index = this.stepObjs.findIndex(e => e.key === key)
    this.stepObjs.splice(index, 1)
  }

  moveObj (key, destinationHex) {
    let obj = this.allObjs.find(e => e.key === key)
    let originHex = obj.hex

    let index = originHex.objs.findIndex(e => e.key === key)
    originHex.objs.splice(index, index + 1)

    destinationHex.objs.push(obj)
    obj.hex = destinationHex

    return obj
  }

  getNeighbors (hex) {
    let world = hex.world
    let list = []
    let x = hex.xloc
    let y = hex.yloc

    const safePush = (obj) => {
      if (obj) list.push(obj)
    }

    if (y % 2 === 0) {
      safePush(world._getHexSafe(x-1, y-1))
      safePush(world._getHexSafe(x-1, y))
      safePush(world._getHexSafe(x-1, y+1))
      safePush(world._getHexSafe(x, y-1))
      safePush(world._getHexSafe(x, y+1))
      safePush(world._getHexSafe(x+1, y))
    } else {
      safePush(world._getHexSafe(x, y-1))
      safePush(world._getHexSafe(x, y+1))
      safePush(world._getHexSafe(x+1, y-1))
      safePush(world._getHexSafe(x+1, y))
      safePush(world._getHexSafe(x+1, y+1))
      safePush(world._getHexSafe(x-1, y))
    }

    return list
  }

  getNewKey () {
    this.objCounter++
    return this.objCounter
  }
}

console.log('HexWorld.js loaded')
