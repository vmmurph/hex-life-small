class Plant {
  name = 'plant'
  size = 1
  doneGrowing = false
  mutationFactor = 20

  constructor (color = 0) {
    this.color = color
  }

  asText () { return 'P' + this.size }

  grow () {
    if (this.size < 5 && Tools.roll(100)) {
      this.size++
    }
  }

  step () {
    this.propagate()
    this.grow()
  }

  propagate () {
    let hex = this.hex
    // find an adjacent space that has no objects in it
    let neighbors = hex.getNeighbors()
    let openNeighbors = neighbors.filter(e => e.objs.length < 1)
    if (openNeighbors.length < 1) return
    // choose one of them randomly
    let index = Tools.getRand(0, openNeighbors.length - 1)
    let chosenHex = openNeighbors[index]
    // chance to grow (ex. roll 5 means 1 in 5 chance)
    if (Tools.roll(5)) {
      let newColor = Tools.mutateColor(this.color, this.mutationFactor)
      chosenHex.add(new Plant(newColor))
    }
  }
}

console.log('Plant.js loaded')