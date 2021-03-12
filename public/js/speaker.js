class NoiseWalker {
  constructor (w, h, index) {
    this.simplex = new SimplexNoise()
    this.tx = Math.random()*1000;
    this.ty = Math.random()*1000;
    this.vel = Math.random() / 100
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

class Orbiter {
  constructor (w, h, index) {
    console.log('index ', index)
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
    acc.setMag(0.15)
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


class Speaker extends Orbiter {
  constructor(w, h, color, index) {
    super(w, h, index)
    this.color = color
  }
  draw () {
    /*
    stroke(this.color)
    for (let i = 1; i < this.points.length; i++) {
      let p1 = this.points[i-1]
      let p2 = this.points[i]
      line(p1.x, p1.y, p2.x, p2.y)
    }
    */
    // fill(this.color)
    stroke(this.color)
    if (this.points.length < 2) return
    let p1 = this.points[this.points.length-2]
    let p2 = this.points[this.points.length-1]
    line(p1.x, p1.y, p2.x, p2.y)
    // ellipse(this.x, this.y, 5, 5);
  }
}