console.log("dates", dates)



dates.map((date, index) => {
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
  })