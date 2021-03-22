// var debug = false


class Debug {
  constructor() {
    this.show = false
    this.$el = $('#gui')
    this.$el.hide()
    this.addEvents()
    this.initParams()
  }
  initParams () {
    // points
    this.showPoints = true 
    window.showPoints = this.showPoints
    this.$showPoints = $('#btn_showPoints')
    this.$showPoints.prop('checked', this.showPoints)
    // draw bg
    this.drawBg = false 
    window.drawBg = this.drawBg
    this.$drawBg = $('#btn_drawBg')
    this.$drawBg.prop('checked', this.drawBg)
    // show words
    this.drawText = true 
    window.drawText = this.drawText
    this.$drawText = $('#btn_drawText')
    this.$drawText.prop('checked', this.drawText)
    
  }
  addEvents () {
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
    $('#btn_showPoints').click(() => {
      this.showPoints = !this.showPoints
      window.showPoints = this.showPoints
    })
    $('#btn_drawBg').click(() => {
      this.drawBg = !this.drawBg
      window.drawBg = this.drawBg
    })
    $('#btn_drawText').click(() => {
      this.drawText = !this.drawText
      window.drawText = this.drawText
    })
  }
  openDebug () {
    this.show = true
    console.log('openDebug')
    this.$el.show()
  }
  closeDebug () {
    this.show = false
    debug = false
    this.$el.hide()
  }
} 