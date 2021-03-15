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


class Speaker extends Orbiter {
  constructor(w, h, color, index, s_data) {
    console.log('speaker data', w, h, color, index, s_data)
    super(w, h, index)
    this.color = color
    this.id = s_data.id
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
    // stroke(this.color)
    if (this.points.length < 2) return
    let p1 = this.points[this.points.length-2]
    let p2 = this.points[this.points.length-1]
    push();
      translate(p2.x, p2.y)    
      let a = atan2(p2.y - height/2, p2.x - width/2);
      // console.log('a ', a )
      rotate(90)
      rotate(a)
      // line(p1.x, p1.y, p2.x, p2.y)
      let tw = textWidth(this.curText)
      translate(-tw/2, -8)
      text(this.curText, 0, 0)
      // rect(0, 0, 10, 10);
    pop();
    // ellipse(this.x, this.y, 5, 5);
  }
}

class Orchestration {
  constructor(audios) {
    // all audios
    this.audios = audios
    // speakers with all audios
    this.speakers = {}
    audios.map((a) => {
      if (this.speakers[a.from_id] == undefined) this.speakers[a.from_id] = []
      this.speakers[a.from_id].push(a)
    })
    // interval counter
    this.counter = 0
  }
  playAudiosWithInterval (num_audios, interval) {
    var play_next = () => {
      this.counter++
      if (this.counter > num_audios) {
        this.counter = 0
        return
      } 
      this.play(this.getRandomAudio(), interval, play_next)
    }
    this.play(this.getRandomAudio(), interval, play_next)
  }

  getRandomAudio () {
    return this.audios[Math.floor(Math.random() * this.audios.length)]
  }

  play (audio, interval, callback) {
    let play_id = Math.floor(Math.random() + 10000)
    this.send(audio, play_id)
    setTimeout(() => {
      this.onEnd(audio, play_id)
      setTimeout(() => {
        callback()
      }, interval * 1000)
    }, (audio.duration_seconds + 1) * 1000)
  }

  send (audio, play_id) {
    var event = new CustomEvent(`play_audio_${audio.from_id}`, {
      detail: {
        audio: audio,
        play_id: play_id
      }
    })
    document.dispatchEvent(event)
  }

  onEnd (audio, play_id) {
    var event = new CustomEvent(`audio_ended_${audio.from_id}`, {
      detail: {
        audio: audio,
        play_id: play_id
      }
    })
    document.dispatchEvent(event)
  }
}