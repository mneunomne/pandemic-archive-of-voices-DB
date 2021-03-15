class Speaker extends Mover {
  constructor(w, h, color, index, s_data) {
    super(w, h, index)
    this.color = color
    this.id = s_data.id
    this.init()
  }
  init () {
    this.addEvents()
    this.curText = ''
  }
  addEvents () {
    document.addEventListener(`play_audio_${this.id}`, this.onPlay.bind(this))
    document.addEventListener(`audio_ended_${this.id}`, this.onEnd.bind(this))
  }
  onPlay (evt) {
    this.curText = evt.detail.audio.text
    console.log('onPlay',evt.detail.audio.text, this.curText)
  }
  onEnd (evt) {
    console.log('onEnd', evt)
    this.curText = ''
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
    if (this.points.length < 2) return
    let p1 = this.points[this.points.length-2]
    let p2 = this.points[this.points.length-1]
    push();
      stroke(this.color)
      if (window.showPoints) line(p1.x, p1.y, p2.x, p2.y)
      stroke(255)
      translate(p2.x, p2.y)    
      let a = atan2(p2.y - height/2, p2.x - width/2);
      // console.log('a ', a )
      rotate(90)
      rotate(a)
      let tw = textWidth(this.curText)
      translate(-tw/2, -8)
      if (window.drawText) text(this.curText, 0, 0)
      // rect(0, 0, 10, 10);
    pop();
    // ellipse(this.x, this.y, 5, 5);
  }
}