class Walker {
  constructor(w, h) {
    this.simplex = new SimplexNoise()
    this.tx = Math.random()*1000;
    this.ty = Math.random()*1000;
    this.vel = Math.random() / 500
    this.width = w
    this.height = h
    this.points = []
    $(window).resize(() => {
      this.width = $('#area').width()
      this.height = $('#area').height()
    });
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

  draw () {
    ellipse(this.x, this.y, 5, 5);
  }
}