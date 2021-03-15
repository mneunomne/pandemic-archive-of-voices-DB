// Orbiter
class Mover {
  constructor (w, h, index) {
    this.time = 0
    this.centre = createVector(0,0)
    this.pos = createVector( 50 + (index  * 10),50)
    this.vel = createVector(0,-3)
    this.width = w
    this.height = h
    this.points = []
  }
  update() {
    var acc = this.centre.copy()
    acc.sub(this.pos)
    acc.setMag(0.03)
    this.vel.add(acc)
    this.pos.add(this.vel)
    // console.log('this.pos',this.pos.x, this.pos.y)
    this.x = this.pos.x + this.width/2
    this.y = this.pos.y + this.height/2
    this.points.push({x: this.x, y: this.y})
    return {
      x: this.x,
      y: this.y
    }
  }
}