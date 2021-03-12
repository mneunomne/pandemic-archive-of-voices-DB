// var debug = false

var debug = function () {
  this.show = false
  this.$el = $('#debug')
  this.init = () => {
    console.log('')
    $(document).keypress((evt) => {
      console.log('keypress', evt.key)
      if (evt.key.toLowerCase() === 'd') {
        if (this.show) {
          this.closeDebug()
        } else {
          this.openDebug()
        } 
      }
    })
    this.addEvents()
  }

  this.addEvents = () => {
    $('#btn_showPoints').click(() => {
      window.showPoints = window.showPoints || false
      window.showPoints = !window.showPoints
    })
    $('#btn_showLines').click(() => {
      window.showLines = false
    })
  }

  this.openDebug = () => {
    this.show = true
    console.log('openDebug')
    this.$el.show()
  }
  this.closeDebug = () => {
    this.show = false
    debug = false
    this.$el.hide()
  }
  return this
}
window.onload = function () {
  var d = debug()
  d.init()
};
