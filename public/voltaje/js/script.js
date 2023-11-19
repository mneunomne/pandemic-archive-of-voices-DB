$(document).ready(() => {

  const default_data_rect = {
    lat:        '4.5002073856140',      // latitude in degrees
    lon:        '-73.93514644020',      // longitude in degrees
    timestamp:   '-2018668331024000',    // timestamp in milliseconds
    az:         '66',                   // (0 = north, 90 = east, 180 = south, 270 = west)
  }

  /* date references
    -2018668331024000 -60000  - 12/12/-60000/12:30
    -125251211024000  -2000     12/12/-60000
    -13696563208000   1563
    1700168294468     2023
    1894393717200000  60000
  */ 

  var d = new Date("-002000/12/12")

  const real_data = dates

  var data_rect = []
  for (var i = 0; i < 20; i++) {
    if (real_data[i]) {
      data_rect.push(real_data[i])
    } else {
      data_rect.push(default_data_rect)
    }
  }


  const default_data = {
    name: 'test',
    width: 320,
    height: 450,
    margin: 15.0,
    gap: 5.0,
    data_rect: data_rect,
    lat: default_data_rect.lat,
    lon: default_data_rect.lon,
    timestamp: default_data_rect.timestamp,
    data_rects_cols: 4,
    data_rects_rows: 5,
  }

  var form = {
    width: $("#width"),
    height: $("#height"),
    margin: $("#margin"),
    gap: $("#gap"),
    lat: $("#latitude"),
    lon: $("#longitude"),
    name: $("#name"),
  }

  var svgNumeralImages = [
    {'char': '1', path: "../images/muisca_numerals/1.svg" },
    {'char': '2', path: "../images/muisca_numerals/2.svg" },
    {'char': '3', path: "../images/muisca_numerals/3.svg" },
    {'char': '4', path: "../images/muisca_numerals/4.svg" },
    {'char': '5', path: "../images/muisca_numerals/5.svg" },
    {'char': '6', path: "../images/muisca_numerals/6.svg" },
    {'char': '7', path: "../images/muisca_numerals/7.svg" },
    {'char': '8', path: "../images/muisca_numerals/8.svg" },
    {'char': '9', path: "../images/muisca_numerals/9.svg" },
    {'char': '10', path: "../images/muisca_numerals/10.svg" },
    {'char': '20', path: "../images/muisca_numerals/20.svg" },
    {'char': '|', path: "../images/muisca_numerals/|.svg" },
    {'char': '-', path: "../images/muisca_numerals/-.svg" },
  ]

  const loadSvgImages = function () {
    return Promise.all(svgNumeralImages.map(function ({char, path}) {
      return new Promise(function (resolve, reject) {
        fetch(path)
          .then(response => response.text())
          .then(svgData => {
            var parser = new DOMParser();
            var svg = parser.parseFromString(svgData, "image/svg+xml").documentElement;
            resolve({char, svg})
          })  
      });
    }));
  }

  function getCharImage(char) {
    var clone = svgNumeralImages.find((item) => item.char == char).svg.cloneNode(true)
    return clone
  }


  loadSvgImages().then(function (svgData) {
    svgNumeralImages = [...svgData]
  }); 
    

  const svgDOM = document.querySelector('#canvas svg')
  const $svg = $("#canvas svg")
  const $right_side = $("#r-side")
  const svg = d3.select("svg")
  var data = default_data
  var dict = {}
  const markerWidth = 4
  const markerHeight = 4

  const markerSize = 7

  const strokeWidth = 2

  function init() {
    var loadDict = fetch('dict.json').then(function(res) {
      return res.json();
    }).then(function(json) {
      dict = json;
      initForm(default_data)
      //initMap()
      drawRect(data);
    });

  }

  const initForm = function (data) {
    for (var field in form) {
      form[field].val(data[field])
      setFieldData(field, data[field])
    }
  }

  const setFieldData = function (key, value) {
    if (key == 'width' || key == 'height') updateSize(key, value)
  }

  const updateSize = function (key, value) {
    if (key && value) svgDOM.setAttribute(key, value + 'mm')
    var margin = 100
    var svg_width = $svg.width() + margin
    var svg_height = $svg.height() + margin
    var parent_width = $right_side.width()
    var parent_height = $right_side.height()
    var prop = Math.min(parent_width / svg_width, parent_height / svg_height)
    $svg.css({
      'transform': 'translate(-50%, -50%) scale(' + prop + ')'
    });
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
    var anchor = svg.append("svg")
      .attr("id", id)
      .attr('width', markerSize +'mm')
      .attr('height', markerSize + 'mm')
      .attr('viewBox', `0 0 ${markerWidth + 2} ${markerHeight + 2}`)
      .attr('x', x)
      .attr('y', y)
    // "Pixels"
    for (var i = 0; i < markerHeight; i++) {
      for (var j = 0; j < markerWidth; j++) {
        var white = bits[i * markerHeight + j];
        if (!white) {
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

  const drawRect = function (data) {
    var gap = data.gap
    var content_width = data.width - data.margin * 2
    var content_height = data.height - data.margin * 2

    var data_rects_width = (content_width - (gap * (data.data_rects_cols - 1))) / data.data_rects_cols
    var data_rects_height = (content_height - (gap * (data.data_rects_rows - 1))) / data.data_rects_rows

    const drawData = function (data) {
      data.data_rect.forEach((d, i) => {
        initPlanetarium(d, i)
        var j = i % data.data_rects_cols
        var i = Math.floor(i / data.data_rects_cols)
        var anchor = svg.append('svg')
          .attr('x', data.margin + (data_rects_width + gap) * j + 'mm')
          .attr('y', data.margin + (data_rects_height + gap) * i + 'mm')
        
        // merge strings of lat, long and timestamp
        var lat = d.lat               // 18 char
        var lon = d.lon               // 18 char 
        var timestamp = d.timestamp + ''   // 18 char
        var az = d.az                 // 3 char
        
        // i need to fit everything in 56 characters
        

        // limit lat to 14 char
        lat = lat.substring(0, 16).padEnd(16, 'X')
        // limit lon to 14 char
        lon = lon.substring(0, 16).padEnd(16, 'X')
        // limit timestamp to 14 char
        timestamp = timestamp.substring(0, 18).padStart(18, 'X')
        // limit az to 3 char
        az = az.substring(0, 3).padStart(3, 'X')
        
        // remove last 4 digits of timestamp
        //timestamp = timestamp.substring(0, timestamp.length - 6)
        
        var s = `${lat}|${lon}|${timestamp}|${az}`.split('')

        // decode function
        var decode = function (string) {
          return string.split("|").map((item) => {
            let result = ''
            if (item[0] == '-') {
              result = '-' + item.substring(1, item.length).replace('-', '.')
            } else {
              result = item.replace('-', '.')
            }
            return parseFloat(result)
          })
        }
        
        // shuffle string
        // s = s.sort(() => Math.random() - 0.5)
        console.log("s", s.join(''))
        
        // there is some error here... 

        var cols = 7
        var rows = 8

        var w = data_rects_width / (cols)

        for (var i = 0; i < cols ; i++) {
          for (var j = 0; j < rows; j++) {

            var char = s[j * cols + i]; // Fix the calculation of char
            var x = w * i; // Fix the calculation of x
            var y = w * j; // Fix the calculation of y

            if (char == undefined || char == 'X') {
              char = '20'
            }

            char = char == '0' ? '10' : char
            char = char == '.' ? '-' : char
            var image_anchor = anchor.append("svg")
              .attr('x', x + 'mm')
              .attr('y', y + 'mm')
              .attr('viewBox', `0 0 ${width} ${width}`)

            var svgImage = getCharImage(char)
            svgImage.setAttribute('width', '9.5mm')
            svgImage.setAttribute('height', '9.5mm')
            svgImage.setAttribute('stroke-width', 3)
            image_anchor.node().appendChild(svgImage)
          }
        }
      })
    }
    var index = 0
    var x, y = 0
    // append data rects in svg
    for (var i = 0; i < data.data_rects_rows; i++) {
      for (var j = 0; j < data.data_rects_cols; j++) {
        x = data.margin + (data_rects_width + gap) * j
        y = data.margin + (data_rects_height + gap) * i
        svg.append('rect')
          .attr('x', x + 'mm')
          .attr('y', y + 'mm')
          .attr('width', data_rects_width + 'mm')
          .attr('height', data_rects_height + 'mm')
          .attr('fill', 'none')
          .attr('stroke', 'black')
          .attr('stroke-width', 0)      
      }
    }

    for (var i = 0; i < data.data_rects_rows + 1; i++) {
      for (var j = 0; j < data.data_rects_cols + 1; j++) {
        x = data.margin + (data_rects_width + gap) * j
        y = data.margin + (data_rects_height + gap) * i
        let _x = (x - (markerSize + gap)/2)
        let _y = (y - (markerSize + gap)/2)
        generateMarker(index, "4x4_1000", _x+ 'mm', _y+ 'mm')
        index++
        let rect_x = x + 3
        let rect_y = y - 3.5
        let rect_width = data_rects_width - (markerSize + gap)/2
        let rect_height = data_rects_height - (markerSize + gap)/2
        
        // horizontal lines
        if (j < data.data_rects_cols) {
          svg.append('rect')
            .attr('x', rect_x + 'mm')
            .attr('y', rect_y + 'mm')
            .attr('width', rect_width + 'mm')
            .attr('height', strokeWidth + 'mm')
            .attr('fill', 'black')
            .attr('stroke', 'black')
            .attr('stroke-width', 0)
        }

        // vertical lines
        if (i < data.data_rects_rows) {
          rect_x = x - 3.5
          rect_y = y + 3
          svg.append('rect')
            .attr('x', rect_x + 'mm')
            .attr('y', rect_y + 'mm')
            .attr('width', strokeWidth + 'mm')
            .attr('height', rect_height + 'mm')
            .attr('fill', 'black')
            .attr('stroke', 'black')
            .attr('stroke-width', 0)
        }

      }
    }
    drawData(data)
  }

  const addEvents = function () {
    for (var field in form) {
      form[field].bind('input propertychange', function (evt) {
        var key = $(this).attr('id')
        var val = $(this).val()
        setFieldData(key, val)
      })
    }

    $("input[name=renderMode]").change(function () {
      renderMode = this.value
      updateText(current_data['content'])
    })

    $(window).on('resize', updateSize)
    $("#download-svg").click(downloadSvg)
  }
  const initPlanetarium = function (date, index) {
    var titleEl = document.createElement('h2');
    titleEl.innerHTML = date.name;
    let d = new Date(date.timestamp);
    var planetarium = S.virtualsky({
      id: 'skymap' + (index + 1),
      projection: 'stereo',
      ra: -90,
      dec: -5.3911111,
      //'dec': -5.3911111,
      latitude: parseFloat(date.lat),
      longitude: parseFloat(date.lon),
      showplanets: true,
      transparent: true,
      // showorbits: true,
      az: parseFloat(date.az),
      ground: true,
      magnitude: 20,
      meteorshowers: true,
      showstarlabels: true,
      scalestars: 2,
      width: 400 ,
      height: 400,// + 15,
      keyboard: true, 
      mouse: true,
      constellations: true,
      constellationlabels: false,
      lang: 'es',
      fontsize: '12px',
      clock: d,
    });
    var parent = document.getElementById('skymap' + (index + 1)).parentNode 
    parent.insertBefore(titleEl, parent.firstChild);
  }

  const downloadSvg = function () {
    var svgDom = document.querySelector('svg').cloneNode(true);
    var style = svgDom.style
    svgDom.style = ''
    //get svg source.
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svgDom);

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
    $("#link-svg").attr("download", data['name'])
    document.getElementById("link-svg").href = url;
    document.getElementById("link-svg").textContent = "download"
    //you can download svg file by right click menu.
  }

  addEvents();
  init();
});