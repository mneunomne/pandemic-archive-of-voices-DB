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

function createWalker() {
  let div = document.createElement('div')
  div.setAttribute("class", "ball")
  let a = document.querySelector("#area").append(div)
  let walker = new Walker(300, 300)
  // this.walker.step()
  setInterval(() => {
    let pos = walker.step()
    div.setAttribute("style", `top: ${pos.y}px; left: ${pos.x}px`)
  }, 50)
} 

for(let i = 0; i < 24; i++) {
  createWalker()
}