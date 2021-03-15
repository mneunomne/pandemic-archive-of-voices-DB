var data; 
const colors = ["#e3a882","#FF7F00","#FFD400","#25e44d","#BFFF00","#6AFF00","#00EAFF","#0095FF","#0040FF","#AA00FF","#FF00AA","#EDB9B9","#E7E9B9","#B9EDE0","#B9D7ED","#DCB9ED","#8F2323","#8F6A23","#4F8F23","#23628F","#6B238F","#d1751f","#737373","#CCCCCC", "#2F8F23"]

var _width = window.innerWidth
var _height = window.innerHeight

var speakers = []

var orchestration
var debug

function setup() {
  createCanvas(_width, _height, P2D);
  debug = new Debug()

  $.getJSON("db/data.json", function(json) {
    data = json; // this will show the info it in firebug console
    data.speakers.map((s_data,i) => createSpeaker(s_data, i))
    
    orchestration = new Orchestration(data.audios)
    orchestration.playAudiosWithInterval(50, 1)
    orchestration.playAudiosWithInterval(50, 3)
    orchestration.playAudiosWithInterval(50, 5)
    background(0, 0, 0)
  });
  textFont('Arial');
  textSize(18)
  fill(255)
  angleMode(DEGREES)

}

function createSpeaker(s_data, i) {
  // walk
  let speaker = new Speaker(_width, _height, colors[i], i, s_data)
  speakers.push(speaker)
}

function update() {
  for (let i = 0; i < speakers.length; i++) {
    speakers[i].update()
  }
}
var _i = 0
function draw() {
  if (window.drawBg) background(0)
  update()
  for (let i = 0; i < speakers.length; i++) {
    speakers[i].draw()
  }  
}