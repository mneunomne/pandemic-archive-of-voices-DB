var data; 
const colors = ["#e3a882","#FF7F00","#FFD400","#25e44d","#BFFF00","#6AFF00","#00EAFF","#0095FF","#0040FF","#AA00FF","#FF00AA","#EDB9B9","#E7E9B9","#B9EDE0","#B9D7ED","#DCB9ED","#8F2323","#8F6A23","#4F8F23","#23628F","#6B238F","#d1751f","#737373","#CCCCCC"]

var _width = window.innerWidth
var _height = window.innerHeight

var speakers = []

function setup() {
  createCanvas(_width, _height);
  for (let i = 0; i < 24; i++) {
    createSpeaker(i)
  }
  background(0, 0, 0)
}

function createSpeaker(i) {
  // walk
  let speaker = new Speaker(_width, _height, colors[i])
  speakers.push(speaker)
}

function update() {
  for (let i = 0; i < speakers.length; i++) {
    speakers[i].update()
  }
}

function draw() {
  // background(0, 0, 0)
  update()
  for (let i = 0; i < speakers.length; i++) {
    speakers[i].draw()
  }
}