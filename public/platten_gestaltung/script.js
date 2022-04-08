

$(document).ready(() => {
  const default_data = {
    width: 320,
    height: 450,
    margin: 15.0,
    font_size: 1,
    letter_spacing_x: 1,
    letter_spacing_y: 1,
    content: '',
    audio_id: 500+Math.floor(Math.random()*499)
  }

  var renderMode = 'binary' // 'text'
  const alphabet = "撒健億媒間増感察総負街時哭병体封列効你老呆安发は切짜확로감外年와모ゼДが占乜산今もれすRビコたテパアEスどバウПm가бうクん스РりwАêãХйてシжغõ小éजভकöলレ入धबलخFসeवমوযиथशkحくúoनবएদYンदnuনمッьノкتبهtт一ادіاгرزरjvةзنLxっzэTपнлçşčतلイयしяトüषখথhцहیরこñóহリअعसमペيフdォドрごыСいگдとナZকইм三ョ나gшマで시Sقに口س介Иظ뉴そキやズВ자ص兮ض코격ダるなф리Юめき宅お世吃ま来店呼설진음염론波密怪殺第断態閉粛遇罩孽關警"

  var form = {
    width: $("#width"),
    height: $("#height"),
    margin: $("#margin"),
    font_size: $("#font_size"),
    letter_spacing_x: $("#letter_spacing_x"),
    letter_spacing_y: $("#letter_spacing_y"),
    content: $("#content"),
  }

  // fiducial marker info
  const markerSize = 20
  const markerCornerDict = "4x4_1000";
  const markerDataDict = "6x6_1000";
  const markerWidth = 4
  const markerHeight = 4
  const markerPixelSize = markerSize / markerWidth

  var json_data = {}
  var dict
  var current_data = default_data

  const svgDOM = document.querySelector('#canvas svg')
  const $svg = $("#canvas svg")
  const $right_side = $("#r-side")
  const svg = d3.select("svg")
  const content_length = $("#content_length")

  const init = function () {
    // Fetch markers dict
    var loadDict = fetch('dict.json').then(function(res) {
      return res.json();
    }).then(function(json) {
      dict = json;
      initForm(default_data)
      addEvents()
    });
  }

  const initForm = function (data) {
    for (var field in form) {
      form[field].val(data[field])
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

  const generateMarker = function (id, dictName, x, y) {
    var bytes = dict[dictName][id];
    var bits = [];
    var bitsCount = markerWidth * markerHeight;

    // Parse marker's bytes
    for (var byte of bytes) {
      var start = bitsCount - bits.length;
      for (var i = Math.min(7, start - 1); i >= 0; i--) {
        bits.push((byte >> i) & 1);
      }
    }

    return generateMarkerRect(x, y, bits, id);
  }

  function generateMarkerRect(x, y, bits, id) {
    var group = svg.selectAll("#markers")
    // Background rect
    var anchor = group.append("svg")
      .attr("id", id)
      .attr('width', '20mm')
      .attr('height', '20mm')
      .attr('viewBox', `0 0 ${markerWidth + 2} ${markerHeight + 2}`)
      .attr('x', x)
      .attr('y', y)
    // background rect, no need
    /*
    var rect = anchor.append("rect")
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', markerWidth + 2)
      .attr('height', markerHeight + 2)
      .attr('fill', 'transparent')
    */
    // "Pixels"
    for (var i = 0; i < markerHeight; i++) {
      for (var j = 0; j < markerWidth; j++) {
        var white = bits[i * markerHeight + j];
        if (white) {
          /*
          no need for white
          var pixel = anchor.append("rect")
            .attr('width', 1)
            .attr('height', 1)
            .attr('x', j + 1)
            .attr('y', i + 1)
            .attr('fill', 'white')
          */
          } else {
            var pixel = anchor.append("rect")
            .attr('width', 1)
            .attr('height', 1)
            .attr('x', j + 1)
            .attr('y', i + 1)
            .attr('fill', 'black')
        }
      }
    }
    // circle around
    for (var i = 0; i < markerHeight+2; i++) {
      for (var j = 0; j < markerWidth+2; j++) {
        if (i == 0 || j == 0 || i == markerWidth+1 || j == markerHeight+1) {
          anchor.append("rect")
            .attr('width', 1)
            .attr('height', 1)
            .attr('x', j)
            .attr('y', i)
            .attr('fill', 'black')
        }
      }
    }
  }

  const updateFrame = function (length) {
    svg.append("g").attr("id", "markers")
    // CORNERS
    // left top 
    generateMarker(1, markerCornerDict, 0, 0)
    // right top
    generateMarker(2, markerCornerDict, `${current_data['width']-markerSize}mm`, 0)
    // left bottom
    generateMarker(3, markerCornerDict, 0, `${current_data['height']-markerSize}mm`)
    // right bottom
    generateMarker(4, markerCornerDict, `${current_data['width']-markerSize}mm`, `${current_data['height']-markerSize}mm`)

    // DATA
    // data-width
    generateMarker(current_data['width'], markerCornerDict, `${current_data['width']/2-markerSize/2}mm`, 0)
    // data-height
    generateMarker(current_data['height'], markerCornerDict, `${current_data['width']-markerSize}mm`, `${current_data['height']/2-markerSize/2}mm`)
    // data-font-size
    generateMarker(Math.floor(current_data['font_size']*100), markerCornerDict, 0, `${current_data['height']/2-markerSize/2}mm`)
    // data-id
    generateMarker(current_data['audio_id'], markerCornerDict, `${current_data['width']/2-markerSize/2}mm`, `${current_data['height']-markerSize}mm`)

    drawDecorationRects()
  }

  const drawDecorationRects = function () {
    // decorations rects
    var rectWidth = `${current_data['width'] / 2 - markerSize*1.5 - 2*markerPixelSize}mm`
    var rectHeight = `${current_data['height'] / 2 - markerSize*1.5 - 2*markerPixelSize}mm`

    var data = [
      {
        'width': rectWidth,
        'height': `${markerPixelSize}mm`,
        'x': `${markerSize + markerPixelSize}mm`,
        'y': `${markerSize/2 - markerPixelSize/2}mm`,
      },
      {
        'width': rectWidth,
        'height': `${markerPixelSize}mm`,
        'x': `${current_data['width'] / 2 + markerSize/2 + markerPixelSize}mm`,
        'y': `${markerSize/2 - markerPixelSize/2}mm`,
      },
      {
        'width': rectWidth,
        'height': `${markerPixelSize}mm`,
        'x': `${markerSize + markerPixelSize}mm`,
        'y': `${current_data['height'] - markerSize/2 - markerPixelSize/2}mm`,
      },
      {
        'width': rectWidth,
        'height': `${markerPixelSize}mm`,
        'x': `${current_data['width'] / 2 + markerSize/2 + markerPixelSize}mm`,
        'y': `${current_data['height'] - markerSize/2 - markerPixelSize/2}mm`,
      },
      {
        'width': `${markerPixelSize}mm`,
        'height': rectHeight,
        'x': `${markerSize/2 - markerPixelSize/2}mm`,
        'y': `${markerSize + markerPixelSize}mm`,
      },
      {
        'width': `${markerPixelSize}mm`,
        'height': rectHeight,
        'x': `${markerSize/2 - markerPixelSize/2}mm`,
        'y': `${current_data['height'] / 2 + markerSize/2 + markerPixelSize}mm`,
      },
      {
        'width': `${markerPixelSize}mm`,
        'height': rectHeight,
        'x': `${current_data['width'] - markerSize/2 - markerPixelSize/2}mm`,
        'y': `${markerSize + markerPixelSize}mm`,
      },
      {
        'width': `${markerPixelSize}mm`,
        'height': rectHeight,
        'x': `${current_data['width'] - markerSize/2 - markerPixelSize/2}mm`,
        'y': `${current_data['height'] / 2 + markerSize/2 + markerPixelSize}mm`,
      }
    ]

    for (var d in data) {
      svg.append("rect")
      .attr("width", data[d]['width'])
      .attr("height", data[d]['height'])
      .attr("x", data[d]['x'])
      .attr("y", data[d]['y'])
      .attr('fill', 'black')  
    }
  }

  const updateText = function (text) {
    // clear svg file
    svg.selectAll("*").remove()
    
    if (text == undefined || text.length == 0) return;
    var positions = []
    // show text length
    content_length.text( text.length)
    // chars from text
    var chars = text.split('')
    // variables for loop
    var width = current_data['width']
    var height = current_data['height']
    var margin = markerSize + 1
    var x = margin
    var y = margin
    var font_size = parseFloat(current_data['font_size'])
    var letter_spacing_x = parseFloat(current_data['letter_spacing_x'])
    var letter_spacing_y = parseFloat(current_data['letter_spacing_y'])
    // if text overflow, show a warning
    var overflow = false
    var index = 0
    for (var c in chars) {
      if (x >= width-margin) {
        x = margin
        y += letter_spacing_y
      }
      if (y > height) overflow = true
      
      switch (renderMode) {
        case 'binary':
          var index = alphabet.indexOf(chars[c]) || 0
          var bin = dec2bin(index).split('')
          bin.map((b) => {
            svg.append("rect")
              .attr("x", x + 'mm')
              .attr("y", y + 'mm')
              .attr("width", font_size + 'mm')
              .attr("height", font_size + 'mm')
              .attr("fill", b == 1 ? 'black' : 'transparent')
            x+= letter_spacing_x
            if (x >= width-margin) {
              x = margin
              y += letter_spacing_y
            }  
          })
          break;
        case 'text':
          svg.append("text")
            .attr("x", x + 'mm')
            .attr("y", y + font_size/1.8 + 'mm')
            .style("font-size", `${font_size}mm`)
            .style("text-anchor", "middle")
            .style("dominant-baseline", "middle")
            .text(chars[c]);
          index++
          x+= letter_spacing_x
          break;
        default:
          break;
      }
      positions.push({
        "char": chars[c],
        "x": x/width,
        "y": y/height,
        "w": font_size/width,
        "h": font_size/height,
        "length": index
      })
    }
    updateFrame(index)
    // current_positions = positions
    json_data = JSON.stringify({
      width,
      height,
      margin,
      letter_spacing_x,
      letter_spacing_y,
      positions
    })
    // console.log('current_positions', current_positions)
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
      form[field].bind('input propertychange', function (evt) {
        console.log("change", $(this).val())
        var key = $(this).attr('id')
        var val = $(this).val()
        setFieldData(key, val)
      })
    }

    $("input[name=renderMode]").change(function () {
      console.log("changed", this.value)
      renderMode = this.value
      updateText(current_data['content'])
    })

    $("#download-svg").click(downloadSvg)
    $("#download-json").click(downloadJson)
    $("#play_audio").click(playSound)
    $(window).on('resize', updateSize)
  }

  const playSound = function () {
    text2Audio(current_data['content'], false)
  }

  const downloadSvg = function () {
    var svgDom = document.querySelector('svg').cloneNode(true);
    var style = svgDom.style
    svgDom.style = ''
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
    document.getElementById("link-svg").href = url;
    document.getElementById("link-svg").textContent = "download"
    //you can download svg file by right click menu.
  }

  const downloadJson = function () {
    console.log("current_data", json_data)
    var url = "data:application/json;charset=utf-8,"+json_data;
     //set url value to a element's href attribute.
     document.getElementById("link-json").href = url;
     document.getElementById("link-json").textContent = "download"
  }

  init()
})

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

