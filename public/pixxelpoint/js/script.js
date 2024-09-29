$(document).ready(() => {
  const default_data_rect = {
    lat:        '45.95240734807733',      // latitude in degrees
    lon:        '13.6340635055379566',      // longitude in degrees
  }

  var d = new Date("-002000/12/12")

	console.log("border", border)

	var ammount = 40

  // fill an array with 20 elements of default_data_rect
	real_data = Array(ammount).fill(default_data_rect)
	console.log("real_data", real_data)

  
  var data_rect = border.map((item) => {
		return {
			lat: `${item.lat}`,
			lon: `${item.lon}`
		}
	})


  const default_data = {
    name: 'test',
    width: 250,
    height: 400,
    margin: 12.0,
    gap: 5.0,
    data_rect: data_rect,
    lat: default_data_rect.lat,
    lon: default_data_rect.lon,
    data_rects_cols: 5,
    data_rects_rows: 8,
    char_w: 5,
    char_h: 6,
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
    {'char': '1', path: "../images/nova_gorica/1.svg" },
    {'char': '2', path: "../images/nova_gorica/2.svg" },
    {'char': '3', path: "../images/nova_gorica/3.svg" },
    {'char': '4', path: "../images/nova_gorica/4.svg" },
    {'char': '5', path: "../images/nova_gorica/5.svg" },
    {'char': '6', path: "../images/nova_gorica/6.svg" },
    {'char': '7', path: "../images/nova_gorica/7.svg" },
    {'char': '8', path: "../images/nova_gorica/8.svg" },
    {'char': '9', path: "../images/nova_gorica/9.svg" },
    {'char': '10', path: "../images/nova_gorica/10.svg" },
    {'char': '20', path: "../images/nova_gorica/20.svg" },
    {'char': '|', path: "../images/nova_gorica/|.svg" },
    {'char': '-', path: "../images/nova_gorica/-.svg" },
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

  const markerSize = 5

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

    var data_rects_width = ((content_width - (gap * (data.data_rects_cols - 1))) / data.data_rects_cols)
    var data_rects_height = ((content_height - (gap * (data.data_rects_rows - 1))) / data.data_rects_rows)

    console.log("data_rects_width", data_rects_width)

    const drawData = function (data) {
      data.data_rect.forEach((d, i) => {
        var j = i % data.data_rects_cols
        var i = Math.floor(i / data.data_rects_cols)
        var anchor = svg.append('svg')
          .attr('x', data.margin + (data_rects_width + gap) * j + 'mm')
          .attr('y', data.margin + (data_rects_height + gap) * i + 'mm')
        
        // merge strings of lat, long and timestamp
        var lat = d.lat               // 18 char
        var lon = d.lon               // 18 char 
        
        // i need to fit everything in 56 characters
        

        // limit lat to 14 char
        lat = lat.substring(0, 13).padEnd(13, 'X')
        // limit lon to 14 char
        lon = lon.substring(0, 13).padEnd(13, 'X')
        
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
        
        // shuffle string
        // s = s.sort(() => Math.random() - 0.5)
        console.log("s", s.join(''))
        
        var inner_padding_y = 1;

        var inner_padding_x = 2;

        var cols = 7
        var rows = 7

        var inner_width = data_rects_width - inner_padding_x * 2 
        
        var w = (inner_width / (cols)) 

        for (var i = 0; i < cols ; i++) {
          for (var j = 0; j < rows; j++) {

            var char = s[j * cols + i]; // Fix the calculation of char
            var x = inner_padding_x + w * i; // Fix the calculation of x
            var y = inner_padding_y + w * j; // Fix the calculation of y

            if (char == undefined || char == 'X') {
              char = '20'
            }

            char = char == '0' ? '10' : char
            char = char == '.' ? '20' : char
            var image_anchor = anchor.append("svg")
              .attr('x', x + 'mm')
              .attr('y', y + 'mm')
              .attr('viewBox', `0 0 ${width} ${width}`)

            var svgImage = getCharImage(char)
            svgImage.setAttribute('width', `${data.char_w}mm`)
            svgImage.setAttribute('height', `${data.char_h}mm`)
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

	function initMap() {
		// Define the bounds using the given lat/lng values

		let pathCoordinates = []; // Array to store the path coordinates

		// Create a map centered within the bounds
		map = new google.maps.Map(document.getElementById("map"), {			
			center: { lat: parseFloat(default_data_rect.lat), lng: parseFloat(default_data_rect.lon) },
			zoom: 17,
			disableDefaultUI: true
		});

		pathCoordinates = data_rect.map((item) => {
			console.log("item", item)
			const latlng =  new google.maps.LatLng(parseFloat(item.lat), parseFloat(item.lon))
			return latlng
		})
	
		// Set satellite view
		map.setMapTypeId('satellite');

		// Initialize the Polyline with an empty path
		polyline = new google.maps.Polyline({
			path: pathCoordinates,
			geodesic: true,
			strokeColor: '#0029FF',
			strokeOpacity: 1,
			strokeWeight: 2.2
		});


		// Add the polyline to the map
		polyline.setMap(map); // 
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
	initMap();
});