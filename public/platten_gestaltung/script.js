

$(document).ready(() => {
  const default_data = {
    width: 320,
    height: 450,
    margin: 15.0,
    font_size: 18,
    letter_spacing_x: 5.0,
    letter_spacing_y: 7.0,
    content: '',
    audio_id: null
  }

  var form = {
    width: $("#width"),
    height: $("#height"),
    margin: $("#margin"),
    font_size: $("#font_size"),
    letter_spacing_x: $("#letter_spacing_x"),
    letter_spacing_y: $("#letter_spacing_y"),
    content: $("#content"),
  }
  
  var current_data = default_data

  const svgDOM = document.querySelector('#canvas svg')
  const $svg = $("#canvas svg")
  const $right_side = $("#r-side")
  const svg = d3.select("svg")
  const content_length = $("#content_length")

  const init = function () {
    initForm(default_data)
    addEvents()
  }

  const initForm = function (data) {
    for (var field in form) {
      form[field].val(data[field])
      console.log("form[field]", form[field])
      setFieldData(field, data[field])
    }
  } 

  
  const setFieldData = function (key, value) {
    current_data[key] = value
    if (key == 'width' || key == 'height') updateSize(key, value)
    if (key == 'margin' || key == 'content' || key == 'letter_spacing_x' || key == 'letter_spacing_y' || key == 'font_size') {
      updateText(current_data['content'])
    }
  }

  const updateText = function (text) {
    if (text == undefined || text.length == 0) return;
    console.log("updateText", text, text.length)
    // clear svg file
    svg.selectAll("*").remove()
    // show text length
    content_length.text( text.length)
    // chars from text
    var chars = text.split('')
    // variables for loop
    var width = current_data['width']
    var height = current_data['height']
    var margin = parseFloat(current_data.margin)
    var x = margin
    var y = margin
    var font_size = parseFloat(current_data['font_size'])
    var letter_spacing_x = parseFloat(current_data['letter_spacing_x'])
    var letter_spacing_y = parseFloat(current_data['letter_spacing_y'])
    // if text overflow, show a warning
    var overflow = false
    for (var c in chars) {
      if (x >= width-margin) {
        x = margin
        y += letter_spacing_y
      }
      if (y > height) overflow = true 
      svg.append("text")
      .attr("x", x + 'mm')
      .attr("y", y + 'mm')
      .style("font-size", `${font_size}px`)
      .style("text-anchor", "middle")
      .text(chars[c]);
      x+= letter_spacing_x
    }
    if (overflow) {
      $(".warning").show()
    } else {
      $(".warning").hide()
    }
  }

  const updateSize = function (key, value) {
    if (key && value) svgDOM.setAttribute(key, value + 'mm')
    var margin = 100
    var svg_width = $svg.width() + margin
    var svg_height = $svg.height() + margin
    var parent_width = $right_side.width()
    var parent_height = $right_side.height()
    var prop = Math.min(parent_width/svg_width, parent_height/svg_height)
    $svg.css({
      'transform': 'translate(-50%, -50%) scale(' + prop + ')'
    });
  }
  
  const addEvents = function () {
    for (var field in form) {
      console.log("form[field]", form[field])
      form[field].bind('input propertychange', function (evt) {
        console.log("change", $(this).val())
        var key = $(this).attr('id')
        var val = $(this).val()
        setFieldData(key, val)
      })
    }

    $("#download").click(downloadSvg)

    $(window).resize(updateSize())
  }

  const downloadSvg = function () {
    console.log("downloadSvg")
    var svgDom = document.querySelector('svg').cloneNode(true);

    var style = svgDom.style
    svgDom.style = ''
    console.log("style", style)
    //get svg source.
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svgDom);

    console.log('source', source)

    //add name spaces.
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    //add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    //convert svg source to URI data scheme.
    var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);

    //set url value to a element's href attribute.
    document.getElementById("link").href = url;
    document.getElementById("link").textContent = "download"
    //you can download svg file by right click menu.
  }

  init()

})