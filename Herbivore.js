class Herbivore {
  name = 'herbivore'
  movementCost = .5
  eatCost = .5
  // how much a herb can mutate when propagating
  mutationFactor = 35
  // chance a herb can eat a plant with the same exact color (0 to 100)
  maxEatChance = 80
  
  constructor (color = 0, calories = 10, gestation = 20) {
    this.color = color
    this.calories = calories
    // how many calorie points to accumulate before propagating
    this.gestation = gestation
  }

  asText () { return 'HH' }

  chanceToEat (plant) {
    let colorDiff = Tools.pacmanDiff(plant.color, this.color)
    let odds = Math.ceil((500 - colorDiff) / 5) - (100 - this.maxEatChance)
    return odds < 0 ? 0 : odds
  }

  eat () {
    let food = this.onFood()
    let chanceToEat = this.chanceToEat(food)
    let success = Tools.chance(chanceToEat)
    if (success) {
      let world = food.hex.world
      this.calories += food.size
      world.removeObj(food.key)
    }
    this.calories -= this.eatCost
    return success
  }

  findFood () {
    let neighborHexes = this.hex.world.getNeighbors(this.hex)
    neighborHexes.push(this.hex)
    let nearbyPlants = []
    neighborHexes.forEach(hex => {
      hex.objs.forEach(obj => {
        if (obj.name === 'plant') nearbyPlants.push(obj)
      })
    })
    let reducer = this.getBestFoodReducer(this)
    if (nearbyPlants.length > 0) {
      return nearbyPlants.reduce(reducer)
    }
    return null
  }

  kill () {
    let world = this.hex.world
    return world.removeObj(this.key)
  }

  plantHasCompetition (plant) {
    // if herb is already on this plant, it doesn't count as competition
    if (this.onSameHexAs(plant)) return false
    // otherwise we want to know if a plant is about to be eaten by a competing herb
    return plant.hex.objs.filter(o => o.name === 'herbivore').length > 0
  }

  scorePlant (plant, verbose = false) {
    let chance = this.chanceToEat(plant) / 100

    let eatCost = chance === 0 ? 0 : 1.0 / chance * this.eatCost
    let movementCost = this.onSameHexAs(plant) ? 0 : this.movementCost
    let competitionRisk = this.plantHasCompetition(plant) ? 1 : 0
    let cost = eatCost + movementCost + competitionRisk
    let reward = chance * plant.size

    if (verbose) {
      console.log(`chance: ${chance}, eatCost: ${eatCost}, movementCost: ${movementCost}, competitionRisk: ${competitionRisk}`)
      console.log(`reward: ${chance} * ${plant.size} = ${reward}`)
    }

    return reward - cost
  }

  comparePlants (plant1, plant2) {
    return this.scorePlant(plant1) > this.scorePlant(plant2) ? plant1 : plant2
  }

  getBestFoodReducer (herb) {
    return (best, curr) => {
      if (!best) return curr
      return this.comparePlants(curr, best)
    }
  }

  /**
   * Returns an integer size between 0 and 10
   */
  getDrawSize () {
    return Math.ceil(this.calories / this.gestation * 10)
  }

  //TODO give better name or have it return true/false
  onFood () {
    let plantHexes = this.hex.objs.filter(o => o.name === 'plant')
    if (plantHexes.length < 1) return false
    return plantHexes[0]
  }

  /**
   * If a hex is given, moves to that hex.
   * 
   * Otherwise, it moves to a random adjacent hex.
   */
  move (hex) {
    let world = this.hex.world
    this.calories -= this.movementCost
    if (hex) {
      return world.moveObj(this.key, hex)
    }
    let neighborHexes = this.hex.world.getNeighbors(this.hex)
    let index = Tools.getRand(0, neighborHexes.length - 1)
    let destinationHex = neighborHexes[index]
    return world.moveObj(this.key, destinationHex)
  }

  onSameHexAs (obj) {
    if (!obj) return false
    return this.hex === obj.hex
  }

  // TODO do calorie check in this function and return success boolean
  propagate () {
    if (this.calories >= this.gestation) {
      let world = this.hex.world
      let neighborHexes = this.hex.getNeighbors()
      let index = Tools.getRand(0, neighborHexes.length - 1)
      let destinationHex = neighborHexes[index]
      let newColor = Tools.mutateColor(this.color, this.mutationFactor)

      // commented out below was used to mutate gestation
      // let newGestation = this.gestation + Tools.getRand(-1, 1)
      // if (newGestation < 2) newGestation = 2
      // let child = new Herbivore(newColor, Math.floor(this.gestation / 2), newGestation)

      let child = new Herbivore(newColor, Math.floor(this.gestation / 2))
      // console.log(`new child made with color ${newColor}, ${Math.floor(this.gestation / 2)} calories`)
      world.addObj(child, destinationHex.xloc, destinationHex.yloc)
      this.calories -= Math.floor(this.gestation / 2)
      return true
    }
    return false
  }

  starved () {
    return this.calories <= 0
  }

  step () {
    if (this.starved()) { return this.kill() }
    if (this.propagate()) { return }

    // look around for the best food for this herb
    let bestFood = this.findFood()
    if (bestFood) {
      let onBestFood = this.onSameHexAs(bestFood)
      let desperate = this.calories <= this.movementCost + this.eatCost
      let tastyEnough = this.scorePlant(bestFood) > 0 || desperate
      if (onBestFood && tastyEnough) { return this.eat() }
      if (!onBestFood) { return this.move(bestFood.hex) }
    }
    
    // random move
    return this.move()
  }
}

console.log('Herbivore.js loaded')