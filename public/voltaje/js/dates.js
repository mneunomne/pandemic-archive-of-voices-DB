const dates  = [
  { // cerimonio de ubaque
    name: "cerimonio de ubaque",  
    index: 0,
    lat:        '4.5002073856140',
    lon:        '-73.93514644020',
    timestamp:   new Date("1563/12/21 1:00:00").getTime(),
    az:         '45', // ?? where was kupited and saturn located? ok
  },
  { // bogotazo
    name: "bogotazo",
    index: 1,
    lat:        '4.59811373930837',
    lon:        '-74.07614559598456',
    timestamp:   new Date("1948/4/9 19:00:00").getTime(),
    az:         '90', // looking towards the mountains ok 
  },
  { // tomada del palacio de justicia
    name: "tomada del palacio de justicia",
    index: 2,
    lat:        '4.599030507947898',
    lon:        '-74.0754373818926',
    timestamp:   new Date("1985/11/7 17:34:11").getTime(),
    az:         '250', // looking towards the mountains ok
  },
  { // el hacer de la ceramica
    name: "el hacer de la ceramica",
    index: 3,
    lat:        '4.64716172739487',
    lon:        '-74.0699379152959',
    timestamp:   new Date("2023/11/16 13:30:00").getTime(),
    az:         '250', // looking towards the mountains
  },
  { // grande conjuncion de jupiter y saturno
    name: "grande conjuncion de jupiter y saturno",
    index: 4,
    lat:        '4.61203073951671',
    lon:        '-74.0688130995132',
    timestamp:   new Date("2020/12/21 17:45:00").getTime(),
    az:         '250', // looking towards the jupiter and saturn?
  },
  { // protestos colombia 2019
    name: "protestos colombia 2019",
    index: 5,
    lat:        '4.645423923616294',
    lon:        '-74.06192698948639',
    timestamp:   new Date("2019/11/29 12:00:00").getTime(),
    az:         '180',
  },
  { // pnext great clustering
    name: "next great clustering",
    index: 6,
    lat:        '4.50019134186379',
    lon:        '-73.9350820670254',
    timestamp:   new Date("2040/11/30 5:56:12").getTime(),
    az:         '95', // looking towards the jupiter and saturn?
  },
  { // Bogotá Earthquake 1763
    name: "Bogotá Earthquake 1763",
    index: 8,
    lat:       '4.47211681706265',
    lon:       '-73.9098395262587',
    timestamp:   new Date("1763/10/18 11:30:00").getTime(),
    az:         '270',
  },
  { // Colombia solar eclipse of 1991
    name: "Colombia solar eclipse of 1991",
    index: 9,
    lat:      '4.61203073951671',
    lon:      '-74.0688130995132',
    timestamp:   new Date("1991/7/11 13:51:12").getTime(),
    az:         '340',
  },
  { // Colombia solar eclipse of 2023
    name: "Colombia solar eclipse of 2023",
    index: 10,
    lat:      '4.61203073951671',
    lon:      '-74.0688130995132',
    timestamp:  new Date("2023/10/14 12:30:00").getTime(),
    az:         '200', // ok
  },
  { // conjunction of -006860
    name: "occultation of -6860",
    index: 11,
    lat:      '4.61203073951671',
    lon:      '-74.0688130995132',
    timestamp:  new Date("-006859/11/23 3:08:46").getTime(),
    az:         '0',
  },
  {
    name: "fundación de bogotá",
    index: 12,
    lat: '4.597223490451007', 
    lon: '-74.06977816014044',
    timestamp: new Date("1538/8/6 18:00:00").getTime(),
    az: '270',
  },
  {
    name: "next close great conjunction",
    index: 13,
    lat: '4.597223490451007', 
    lon: '-74.06977816014044',
    timestamp: new Date("2080/3/15 6:06:13").getTime(),
    az: '110',
  },
  {
    name: 'great conjunction of 4 March 1226',
    index: 14,
    lat: '4.597223490451007', 
    lon: '-74.06977816014044',
    timestamp: new Date("1224/2/21 6:15:00").getTime(),
    az: '180',
  },
  {
    name: 'voltaje exhibition',
    index: 15,
    lat: '4.66241757962485',
    lon: '-74.0557940110939',
    timestamp: new Date("2023/11/23 19:00:00").getTime(),
    az: '120',
  },
  {
    name: 'Next Annular Solar Eclipse',
    index: 16,
    lat: '4.597223490451007', 
    lon: '-74.06977816014044',
    timestamp: new Date("2028/1/26 10:01:30").getTime(),
    az: '120',
  },
  {
    name: 'Total solar eclipse in Bogotá 1940',
    index: 17,
    lat: '4.597223490451007', 
    lon: '-74.06977816014044',
    timestamp: new Date("1940/10/1 7:14:00").getTime(),
    az: '90',
  },
  {
    name: 'total solar eclipse of 1916',
    index: 18,
    lat: '4.597223490451007', 
    lon: '-74.06977816014044',
    timestamp: new Date("1916/2/3 11:00:00").getTime(),
    az: '120',
  },
  {
    name: 'ley de 1890',
    index: 19,
    lat: '4.597223490451007', 
    lon: '-74.06977816014044',
    timestamp: new Date("1890/11/25 18:25:00").getTime(),
    az: '250',
  },
  {
    name: 'next occultation',
    index: 19,
    lat: '4.597223490451007', 
    lon: '-74.06977816014044',
    timestamp: new Date("7548/7/11 1:52:00").getTime(),
    az: '180',
  },
].sort((a, b) => a.timestamp - b.timestamp);


/*
{ // Bogotá Earthquake 1917
    name: "Bogotá Earthquake 1917",
    index: 7,
    lat:        '4.50019134186379',
    lon:        '-73.9350820670254',
    timestamp:   new Date("1917/8/31 6:36:00").getTime(),
    az:         '307', // looking outwards from the church of chapinero
  },
  */