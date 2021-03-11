class Walker {
  constructor(w, h) {
    this.simplex = new SimplexNoise()
    this.tx = Math.random()*1000;
    this.ty = Math.random()*1000;
    this.vel = Math.random() / 100
    this.width = w
    this.height = h
  }
  step() {
    let x = this.simplex.noise2D(this.tx, this.width)
    let y = this.simplex.noise2D(this.ty, this.height)
    this.tx+= this.vel;
    this.ty+= this.vel;
    return {
      x: x*this.width/2 + this.width/2, 
      y: y*this.height/2 + this.height/2
    }
  }
}