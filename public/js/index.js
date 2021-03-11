
var data; 

const colors = ["#FF0000","#FF7F00","#FFD400","#FFFF00","#BFFF00","#6AFF00","#00EAFF","#0095FF","#0040FF","#AA00FF","#FF00AA","#EDB9B9","#E7E9B9","#B9EDE0","#B9D7ED","#DCB9ED","#8F2323","#8F6A23","#4F8F23","#23628F","#6B238F","#000000","#737373","#CCCCCC"]

function createWalker(s, i) {
  // circle
  let circle = document.createElement('div')
  circle.setAttribute("class", "ball")
  circle.setAttribute("data-id", s.id)
  document.querySelector("#area").append(circle)

  let circle2 = document.createElement('div')
  circle2.setAttribute("class", "ball")
  circle2.setAttribute("data-id", s.id)
  document.querySelector("#names").append(circle2)
  circle2.setAttribute("style", `background: ${colors[i]}`)
  circle2.innerText = s.speaker

  // walk
  let walker = new Walker(300, 300)
  setInterval(() => {
    let pos = walker.step()
    circle.setAttribute("style", `top: ${pos.y}px; left: ${pos.x}px; background: ${colors[i]}`)
  }, 50)
}

class Orchestration {
  constructor(audios) {
    // all audios
    this.audios = audios
    // speakers with all audios
    this.speakers = {}
    audios.map((a) => {
      if (this.speakers[a.from_id] == undefined) this.speakers[a.from_id] = []
      console.log('this.speakers[a.id]', this.speakers[a.from_id])
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
    console.log('play!', audio.duration_seconds, interval)
    this.send(audio, play_id)
    setTimeout(() => {
      console.log('finnished')
      this.onEnd(audio, play_id)
      setTimeout(() => {
        callback()
      }, interval * 1000)
    }, audio.duration_seconds * 1000)
  }

  send (audio, play_id) {
    var event = new CustomEvent('play_audio', {
      detail: {
        audio: audio,
        play_id: play_id
      }
    })
    document.dispatchEvent(event)
  }

  onEnd (audio, play_id) {
    var event = new CustomEvent('audio_ended', {
      detail: {
        audio: audio,
        play_id: play_id
      }
    })
    document.dispatchEvent(event)
  }
}

const onAudioPlayed = (evt) => {
  let audio = evt.detail.audio
  let play_id = evt.detail.play_id
  let balls = $(`.ball[data-id="${audio.from_id}"]`)
  balls.each(function () {
    let txt = $(this).text()
    // if (txt.length > 0) {
      $(this).text(txt + ` ${audio.text}`)
    // }
    $(this).addClass(`speaking-${play_id}`);
  })
}

const onAudioEnded = (evt) => {
  let audio = evt.detail.audio
  let from_id = evt.detail.audio.from_id
  let play_id = evt.detail.play_id
  let balls = $(`.ball[data-id="${from_id}"]`)
  balls.each(function () {
    $(this).removeClass(`speaking-${play_id}`)
    
    var new_text = $(this).text().replace(` ${audio.text}`, ""); 
    $(this).text(new_text);
  })
  // console.log('onAudioEnded',id)
}

document.addEventListener('play_audio', onAudioPlayed)
document.addEventListener('audio_ended', onAudioEnded)

$.getJSON("db/data.json", function(json) {
  data = json; // this will show the info it in firebug console
  console.log('data', data)
  data.speakers.map((s,i) => createWalker(s, i))

  var orch = new Orchestration(data.audios)
  orch.playAudiosWithInterval(50, 1)
  orch.playAudiosWithInterval(90, 1.3)
  orch.playAudiosWithInterval(30, 10)
});