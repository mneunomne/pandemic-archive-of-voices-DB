
var data; 

const colors = [ 
	"#FF0000",
	"#FF7F00",
	"#FFD400",
	"#FFFF00",
	"#BFFF00",
	"#6AFF00",
	"#00EAFF",
	"#0095FF",
	"#0040FF",
	"#AA00FF",
	"#FF00AA",
	"#EDB9B9",
	"#E7E9B9",
	"#B9EDE0",
	"#B9D7ED",
	"#DCB9ED",
	"#8F2323",
	"#8F6A23",
	"#4F8F23",
	"#23628F",
	"#6B238F",
	"#000000",
	"#737373",
	"#CCCCCC"
]

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

function createWalker(s, i) {
  // circle
  let circle = document.createElement('div')
  circle.setAttribute("class", "ball")
  document.querySelector("#area").append(circle)

  let circle2 = document.createElement('div')
  circle2.setAttribute("class", "ball")
  document.querySelector("#names").append(circle2)
  circle2.setAttribute("style", `background: ${colors[i]}`)
  circle2.innerText = s.speaker

  //document.querySelector("#names").append(circle)
  
  // walk
  let walker = new Walker(300, 300)
  setInterval(() => {
    let pos = walker.step()
    circle.setAttribute("style", `top: ${pos.y}px; left: ${pos.x}px; background: ${colors[i]}`)
  }, 50)
}

$.getJSON("db/data.json", function(json) {
  data = json; // this will show the info it in firebug console
  console.log('data', data)
  data.speakers.map((s,i) => createWalker(s, i))
});