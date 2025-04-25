$(document).ready(() => {
  const default_data_rect = {
    lat:        '45.95240734807733',      // latitude in degrees
    lon:        '13.6340635055379566',      // longitude in degrees
  }

	var ammount = 63

  // fill an array with 20 elements of default_data_rect
	var real_data = Array(ammount).fill(default_data_rect)
	// console.log("real_data", real_data)

  
  var all_data_rect = border.map((item) => {
		return {
			lat: `${item.lat}`,
			lon: `${item.lon}`
		}
	})


  var polyline

	// limit data_rect to 80 elements
	var data_rect = all_data_rect.slice(0, ammount)

  const default_data = {
    name: 'test',
    width: 184,
    height: 266,
    margin: 20.0,
    gap: 5.0,
    data_rect: data_rect,
    lat: default_data_rect.lat,
    lon: default_data_rect.lon,
    cols: 7,
    rows: 9,
    char_w: 3,
    char_h: 3,
    markerSize: 7,
    startIndex: 0,
  }

  var form = {
    width: $("#width"),
    height: $("#height"),
    margin: $("#margin"),
    gap: $("#gap"),
    lat: $("#latitude"),
    lon: $("#longitude"),
    name: $("#name"),
    cols: $("#cols"),
    rows: $("#rows"),
    char_w: $("#char_w"),
    char_h: $("#char_h"),
    markerSize: $("#markerSize"),
    startIndex: $("#startIndex"),
  }

	let folder = 'white'

  var svgNumeralImages = [
    {'char': '1', path: `../images/nova_gorica/${folder}/1.svg` },
    {'char': '2', path: `../images/nova_gorica/${folder}/2.svg` },
    {'char': '3', path: `../images/nova_gorica/${folder}/3.svg` },
    {'char': '4', path: `../images/nova_gorica/${folder}/4.svg` },
    {'char': '5', path: `../images/nova_gorica/${folder}/5.svg` },
    {'char': '6', path: `../images/nova_gorica/${folder}/6.svg` },
    {'char': '7', path: `../images/nova_gorica/${folder}/7.svg` },
    {'char': '8', path: `../images/nova_gorica/${folder}/8.svg` },
    {'char': '9', path: `../images/nova_gorica/${folder}/9.svg` },
    {'char': '0', path: `../images/nova_gorica/${folder}/0.svg` },
    {'char': '|', path: `../images/nova_gorica/${folder}/|.svg` },
    {'char': '-', path: `../images/nova_gorica/${folder}/-.svg` },
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

  const strokeWidth = 1

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
    console.log("setFieldData", key, value)
    if (key == 'width' || key == 'height') {
      updateSize(key, value)
      updateMapSize() // Add this line
    }
    if (key !== "name") {
      value = parseFloat(value)
    }
    data[key] = value
    data.data_rect = all_data_rect.slice(data.startIndex, data.startIndex + (data.cols * data.rows))
    drawRect(data);

    updatePolyline(data.data_rect)
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
    //console.log("generateMarker", id, dictName, x, y)
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
    generateMarkerRect(x, y, bits, id);
  }

  function generateMarkerRect(x, y, bits, id) {
    // Background rect
    /*
    var bg = svg.append("rect")
      .attr("id", id)
      .attr('width', data.markerSize + 'mm') 
      .attr('height', data.markerSize + 'mm')
      .attr('x', x + 'mm')
      .attr('y', y + 'mm')
      .attr('fill', 'white')
      .attr('stroke', 'black')
    */
    x = parseFloat(x)
    y = parseFloat(y)

    let pixelWidth = data.markerSize / (markerWidth + 2)

    // "Pixels"
    for (var i = 0; i < markerHeight; i++) {
      for (var j = 0; j < markerWidth; j++) {
        var white = bits[i * markerHeight + j];
        if (!white) {
          svg.append("rect")
            .attr('width', pixelWidth + 'mm')
            .attr('height', pixelWidth + 'mm')
            .attr('x', (x + (j + 1) * pixelWidth) + 'mm')
            .attr('y', (y + (i + 1) * pixelWidth) + 'mm')
            .attr('fill', 'black')
        }
      }
    }
    // circle around
    for (var i = 0; i < markerHeight+2; i++) {
      for (var j = 0; j < markerWidth+2; j++) {
        if (i == 0 || j == 0 || i == markerWidth+1 || j == markerHeight+1) {
          svg.append("rect")
            .attr('width', pixelWidth + 'mm')
            .attr('height', pixelWidth + 'mm')
            .attr('x', (x + j * pixelWidth) + 'mm')
            .attr('y', (y + i * pixelWidth) + 'mm')
            .attr('fill', 'black')
        }
      }
    }
}

  
const drawRect = function (data) {
  // clear svg
  svg.selectAll("*").remove()
  // set svg size
  svg.attr('width', data.width + 'mm')
  svg.attr('height', data.height + 'mm')

  var gap = data.gap
  var content_width = data.width - data.margin * 2
  var content_height = data.height - data.margin * 2

  var data_rects_width = (content_width / data.cols)
  var data_rects_height = (content_height / data.rows)
  
  var index = 0

  const drawData = function (data) {
    data.data_rect.forEach((d, idx) => {
      let type = idx % 2 == 0 ? 'black' : 'white'
      var j = idx % data.cols
      var i = Math.floor(idx / data.cols)
      let base_x = data.margin + (data_rects_width) * j
      let base_y = data.margin + (data_rects_height) * i
      
      var lat = d.lat               // 18 char
      var lon = d.lon               // 18 char 
      
      // limit lat to 14 char
      lat = lat.substring(0, 20).padEnd(20, '0')
      // limit lon to 14 char
      lon = lon.substring(0, 20).padEnd(20, '0')
      
      var s = `${lat}|${lon}`.split('')

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
      
      // console.log("s", s.join(''))
      
      var inner_padding_y = 1.1;
      var inner_padding_x = 1;
      let z = 2
      var cols = 5 + z
      var rows = 6 + z

      var inner_width = data_rects_width - inner_padding_x * 2 
      var inner_height = data_rects_height - inner_padding_y * 2
      
      var w = (inner_width / (cols))
      var h = (inner_height / (rows))
      let char_index = 0
      
      for (var i = 0; i < cols ; i++) {
        for (var j = 0; j < rows; j++) {
          if (i < z && j < z || i > cols - (z+1) && j > rows - (z+1)) {
            continue;
          }
          if (i < z && j > rows - (z+1) || i > cols - (z+1) && j < z) {
            continue;
          }

          var char = s[char_index];
          var x = base_x + inner_padding_x + w * i;
          var y = base_y + inner_padding_y + h * j;

          char = char == '.' ? '-' : char

          var svgImage = getCharImage(char)
          svgImage.setAttribute('width', `${data.char_w}mm`)
          svgImage.setAttribute('height', `${data.char_h}mm`)
          svgImage.setAttribute('x', x + 'mm')
          svgImage.setAttribute('y', y + 'mm')
          svg.node().appendChild(svgImage)
          char_index++;
        }
      }
    })
  }
  
 //var index = 0
  var x, y = 0
  // append data rects in svg
  // no need for this...
  /*
  for (var i = 0; i < data.rows; i++) {
    for (var j = 0; j < data.cols; j++) {
      x = data.margin + (data_rects_width) * j
      y = data.margin + (data_rects_height) * i
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
  */

  for (var i = 0; i < data.rows + 1; i++) {
    for (var j = 0; j < data.cols + 1; j++) {
      let _index = i * (data.cols + 1) + j
      x = data.margin + (data_rects_width) * j
      y = data.margin + (data_rects_height) * i
      let _x = (x - (data.markerSize)/2)
      let _y = (y - (data.markerSize)/2)
      generateMarker(_index + data.startIndex, "4x4_1000", _x, _y)
      let rect_x = x + data.markerSize
      let rect_y = y 
      let rect_width = data_rects_width - (data.markerSize + gap)
      let rect_height = data_rects_height - (data.markerSize + gap)

      let line_stroke_weight = 0//0.2
      
      // horizontal lines
      if (j < data.cols) {
        svg.append('rect')
          .attr('x', rect_x + 'mm')
          .attr('y', rect_y + 'mm')
          .attr('width', rect_width + 'mm')
          .attr('height', line_stroke_weight + 'mm')
          .attr('fill', 'black')
          .attr('stroke', 'black')
          .attr('stroke-width', 0)
      }
      // vertical lines
      if (i < data.rows) {
        rect_x = x 
        rect_y = y + data.markerSize
        svg.append('rect')
          .attr('x', rect_x + 'mm')
          .attr('y', rect_y + 'mm')
          .attr('width', line_stroke_weight + 'mm')
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

  function updatePolyline(_data_rect) {
    // Clear existing polylines
    if (polyline) {
        polyline.setMap(null);
    }
    
    // Create new path coordinates from the data_rect
    const pathCoordinates = _data_rect.map(item => {
        return new google.maps.LatLng(
            parseFloat(item.lat),
            parseFloat(item.lon)
        );
    });
    
    // Create new polyline
    polyline = new google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1,
        strokeWeight: 2.2
    });
    
    // Add to map
    polyline.setMap(map);
    
    // Fit the map to the bounds of the polyline
    if (pathCoordinates.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        pathCoordinates.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds);
        
        // Add some padding if needed
        map.padding = 20;
    }
}

function updateMapSize() {
  // Get SVG dimensions in mm
  const svgWidth = parseFloat(svg.attr('width'));
  const svgHeight = parseFloat(svg.attr('height'));
  console.log("svgWidth, svgHeight", svgWidth, svgHeight)
  
  // Calculate aspect ratio
  const aspectRatio = svgWidth / svgHeight;
  
  // Get the map container
  const mapElement = document.getElementById('map');
  
  // Set map width based on its current height
  const mapHeight = mapElement.offsetHeight;
  const mapWidth = mapHeight * aspectRatio;

  console.log("|mapWidth", mapWidth, mapElement)
  
  // Apply the new height
  mapElement.style.width = `${mapWidth}px !important`;

  
  // Trigger a map resize if the map is already initialized
  if (map) {
      google.maps.event.trigger(map, 'resize');
  }
}

  function initMap() {
    // Create a map centered within the bounds
    map = new google.maps.Map(document.getElementById("map"), {			
        center: { lat: parseFloat(default_data_rect.lat), lng: parseFloat(default_data_rect.lon) },
        zoom: 17,
        disableDefaultUI: true
    });

    // Set satellite view
    map.setMapTypeId('satellite');

    // Initialize the polyline with the current data_rect
    updatePolyline(data_rect);
    
    // Set initial map size
    updateMapSize();
}

  const downloadSvg = function () {
    var svgDom = document.querySelector('svg').cloneNode(true);
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
		let name = `${document.getElementById("name").value}_${data.width}x${data.height}_${data.cols}-${data.rows}-${data.startIndex}`
    $("#link-svg").attr("download", name)
    document.getElementById("link-svg").href = url;
    document.getElementById("link-svg").textContent = name + ".svg"
    //you can download svg file by right click menu.
  }

  addEvents();
  init();
	initMap();
});