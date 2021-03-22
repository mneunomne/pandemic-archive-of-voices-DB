// Noise Walker
class Mover {
  constructor (w, h, index) {
    this.simplex = new SimplexNoise()
    this.tx = Math.random()*1000;
    this.ty = Math.random()*1000;
    this.vel = Math.random() / 500
    this.width = w
    this.height = h
    this.points = []
  }
  update() {
    let x = this.simplex.noise2D(this.tx, this.width)
    let y = this.simplex.noise2D(this.ty, this.height)
    this.x = x*this.width/2 + this.width/2,
    this.y = y*this.height/2 + this.height/2
    this.tx+= this.vel;
    this.ty+= this.vel;
    this.points.push({x: this.x, y: this.y})
    return {
      x: this.x,
      y: this.y
    }
  }
}