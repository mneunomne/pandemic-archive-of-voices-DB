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