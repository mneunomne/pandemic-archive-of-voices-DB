const express = require('express')
const fs = require('fs')
const cors = require('cors')
const multer = require('multer')
const marked = require('marked')
const { exec } = require("child_process")
const { getAudioDurationInSeconds } = require('get-audio-duration')
require('dotenv').config()
const upload = multer();
const app = express()
const { Client } = require('node-osc');

/* -------------------------------------------------
Global vars
---------------------------------------------------*/
const port = process.env.PORT || 3000
const hostname = process.env.HOSTNAME || '127.0.0.1'
const ip_address = process.env.IP_ADDRESS || '127.0.0.1'
const dest_folder = `public/${process.env.DEST_FOLDER}`

/* -------------------------------------------------
Certificates
var privateKey = fs.readFileSync( 'privatekey.pem' );
var certificate = fs.readFileSync( 'certificate.pem' );
---------------------------------------------------*/

/* -------------------------------------------------
Start OSC Client
---------------------------------------------------*/
var oscClient = new Client(process.env.SYNC_OSC_IP, process.env.SYNC_OSC_PORT);
oscClient.send('/hello', 200, () => {
  console.log('sent osc message')
})


/* -------------------------------------------------
Generate README html 
---------------------------------------------------*/
var readMe = fs.readFileSync('README.md', 'utf-8');
var markdownReadMe = marked(readMe);
markdownReadMe = markdownReadMe.concat(`<style>body { font-family: 'Courier New'; }</style>`)
fs.writeFileSync('./public/README.html', markdownReadMe);

/* -------------------------------------------------
Read data.json file
---------------------------------------------------*/
var db_json = fs.readFileSync('public/db/data.json')
var db_data = JSON.parse(db_json)

/* -------------------------------------------------
Express configs
---------------------------------------------------*/
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use(express.static('public'))

/* -------------------------------------------------
Router
---------------------------------------------------*/
app.get('/api/data', function (req, res) {
  let obj = JSON.parse(db_json);
  res.json(obj);
})

app.get('/api/speakers', function (req, res) {
  let obj = JSON.parse(db_json);
  res.json(obj.speakers);
})

app.get('/speaker_id/:id', function (req, res) {
  let id = parseInt(req.params.id)
  let obj = JSON.parse(db_json);
  let audios = obj.audios.filter(a => {
    return a.from_id === id
  })
  res.json(audios);
})

app.get('/api/speaker/:name', function (req, res) {
  let name = req.params.name.toLowerCase()
  let obj = JSON.parse(db_json);
  let audios = obj.audios.filter(a => a.from.toLowerCase().includes(name))
  res.json(audios);
})

app.get('/api/audio_id/:id', function (req, res) {
  let id = req.params.id
  let obj = JSON.parse(db_json);
  let audio = obj.audios.find(a => a.id === id)
  res.json(audio);
})

app.get('/api/audio_text/:text', function (req, res) {
  let text = req.params.text
  let obj = JSON.parse(db_json);
  let audios = obj.audios.filter(a => a.text.toLowerCase().includes(text))
  res.json(audios);
})

app.get('/api/audio_lang_name/:lang_name', function (req, res) {
  let lang_name = req.params.lang_name
  let obj = JSON.parse(db_json);
  let audios = obj.audios.filter(a => a.lang.name.toLowerCase().includes(lang_name))
  res.json(audios);
})

app.get('/api/audio_lang_code/:lang_code', function (req, res) {
  let lang_code = req.params.lang_code
  let obj = JSON.parse(db_json);
  let audios = obj.audios.filter(a => a.lang.code.toLowerCase().includes(lang_code))
  res.json(audios);
})

/* -------------------------------------------------
POST
---------------------------------------------------*/
app.post('/api/audio', upload.none(), function (req, res) {
  // console.log("request body", req.body)
  var userId = req.body.id
  var audioBlob = req.body.data
  var lang_code = req.body.languageInput === 'null' ? '' : req.body.languageInput
  var lang_other = req.body.otherLanguage === 'null' ? '' : req.body.otherLanguage
  var text = req.body.textInput

  // Validation
  if (audioBlob === undefined || audioBlob === null || !audioBlob.includes('data:audio/wav;base64')) {
    // error in audio blob
    res.end('{"error" : "error in audio blob", "status" : 400}');
    return
  }
  if (userId === '' || userId === null || userId === undefined) {
    // error in userId
    res.end('{"error" : "error in userId", "status" : 400}');
    return
  }
  if ((lang_code === null || lang_code === undefined || lang_code === '') && (lang_other === null || lang_other === undefined || lang_other === '')) {
    // error in lang
    res.end('{"error" : "error in lang", "status" : 400}');
    return
  }
  if (text === null || text === undefined || text === '') {
    // error in text
    res.end('{"error" : "error in text", "status" : 400}');
    return
  }
  var dest_folder = 'public/db_test'
  var base64data = audioBlob.split(",")[1]
  var timestamp = Date.now()
  var userFolder = `${dest_folder}/audios/${userId}`
  // Create the user folder if needed
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder);
  }
  // Write new file
  var filepath_tmp = `${userFolder}/${timestamp}_tmp.wav`
  var filepath = `${userFolder}/${timestamp}.wav`
  fs.writeFile(filepath_tmp, base64data, { encoding: 'base64' }, function (err) {
    console.log('File created');
    // convert audio file with ffmpeg
    exec(`ffmpeg -y -i ${filepath_tmp} ${filepath} -ar 48000`, (error, stdout, stderr) => {
      if (error) {
        console.log(`conversion error: ${error.message}`)
        return
      }
      if (stderr) {
        // delete tmp file
        fs.unlinkSync(filepath_tmp)
        console.log(`conversion stderr: ${stderr}`)

        getAudioDurationInSeconds(filepath).then((duration) => {
          let path = filepath.split('public/')[1]
          // language
          var audio_id = makeid(8)
          let audio_data = {
            name: "",
            user_id: userId,
            filepath: path,
            id: audio_id,
            text: text,
            duration_seconds: duration,
            lang_code: lang_code,
            lang_other: lang_other,
          }
          // write on json file
          writeData(audio_data)

          // send osc message with new audio data
          oscClient.send('/new_audio', JSON.stringify(audio_data), () => {
            console.log('sent osc message')
          })

          res.end('{"success" : "Submited new audio", "status" : 200}');
        });
      }
    })
  });
})

/* -------------------------------------------------
Update data.json file
---------------------------------------------------*/
const writeData = function (data) {
  var audioObj = {
    "from": data.name,
    "file": data.filepath,
    "id": data.id,
    "text": data.text,
    "from_id": data.user_id,
    "duration_seconds": data.duration_seconds,
    "lang": {
      "name": data.lang_other,
      "code": data.lang_code,
      "standard": ""
    }
  }
  db_data.audios.push(audioObj)
  // check if user data is already in db
  if (!db_data.speakers.some(s => s.id === data.user_id)) {
    var userObj = {
      "speaker": data.name,
      "id": data.user_id
    }
    db_data.speakers.push(userObj)
  }
  // write file
  fs.writeFileSync(`${dest_folder}/data.json`, JSON.stringify(db_data, null, 4))
}

app.listen(port, ip_address, (err) => {
  if (err) throw err
  console.log(`Server running in ${ip_address}:${port}`)
})


function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}


module.exports = app