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
const http = require('http')
const https = require('https')
const mongoose = require ("mongoose")
var aws = require('aws-sdk');

/* -------------------------------------------------
Global vars
---------------------------------------------------*/
const port = process.env.PORT || 3000
const dest_folder = `public/db`
var server = null
const S3_BUCKET = process.env.S3_BUCKET;

/* -------------------------------------------------
Amazon S3
---------------------------------------------------*/
aws.config.region = 'eu-west-1';
var s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


/* -------------------------------------------------
MongoDB
---------------------------------------------------*/
const mongoUri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOSTNAME}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
var mongoConnected = false

mongoose.connect(mongoUri, { useNewUrlParser: true }, function (err, res) {
  if (err) {
    console.error(err)
    throw err
  }
  mongoConnected = true
  console.log(`[MongoDB] Connected to database "${process.env.MONGODB_DATABASE}"`)
})

const Audio = mongoose.model('Audio', mongoose.Schema({
    id: String,
    name: String,
    path: String,
    text: String,
    user_id: String,
    duration: Number,
    disabled: Boolean,
    deleted: Boolean,
    lang: Object
}));

const User = mongoose.model('User', mongoose.Schema({
    name: String,
    id: String
}));

/* -------------------------------------------------
Start http(s) server
---------------------------------------------------*/
if (process.env.LOCAL === '1') {
  // LOCAL ENV
  server = http.Server(app)
} else {
  // REMOTE ENV
  server = https.Server(app)
}

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
Socket io
---------------------------------------------------*/
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
// Add a connect listener
io.on('connection', function(socket) { 
  console.log('Client connected.');
  // Disconnect listener
  socket.on('disconnect', function() {
      console.log('Client disconnected.');
  });
});
/* -------------------------------------------------
Listen to port
---------------------------------------------------*/
server.listen(port, (err) => {
  if (err) throw err
  console.log(`Server running in ${port}`)
})

/* -------------------------------------------------
Routes
---------------------------------------------------*/
app.get('/api/data', function (req, res) {
  let query = { $or: [ { deleted: false }, { deleted: { $exists: false} } ] }
  Audio.find(query, function (err, audios) {
    if (err) console.error(err)
    User.find({}, function (err, users) {
      if (err) console.error(err)
      console.log("object", audios, users)
      res.json({
        audios,
        users
      });
    })
  })
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
  var user_id = req.body.id
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
  if (user_id === '' || user_id === null || user_id === undefined) {
    // error in user_id
    res.end('{"error" : "error in user_id", "status" : 400}');
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
  var dest_folder = 'public/db'
  var base64data = audioBlob.split(",")[1]
  var timestamp = Date.now()
  var userFolder = `${dest_folder}/audios/${user_id}`
  // Create the user folder if needed
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder);
  }
  // Write new file
  var audio_id = makeid(8)
  var filepath_tmp = `${userFolder}/${audio_id}_tmp.wav`
  var filepath = `${userFolder}/${audio_id}.wav`
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

        // after s3 upload
        const onAudioUploaded = (path) => {
          if (!mongoConnected) {
            console.warn("[MongoDB] MongoDB not connected, can't update db.")
            return
          }
          console.log(`[S3] File uploaded successfully`, path);
          getAudioDurationInSeconds(filepath).then((duration) => {
            new Audio({
              id: audio_id + "",
              name: "",
              path: path,
              text: text,
              user_id: user_id + "",
              duration: duration,
              disabled: true,
              deleted: false,
              lang: {
                name: lang_other,
                code: lang_code,
                standard: ""
              }
            }).save(function (err) {
                if (err) return console.error(err);
                console.log(`[MongoDB] saved to ${audio_id} database!`,)
                // emit socket io to max folder updater
                setTimeout(()=> {
                  io.emit("update", {id: audio_id});
                }, 500)
            });

            User.findOne({id: user_id}, function (err, user) {
              if (user === null) {
                // new user 
                new User({
                  id: user_id,
                  name: ""
                }).save(function (err) {
                  if (err) return console.error(err);
                  console.log('[MongoDB] saved user in database')
                })
              } else {
                console.log('[MongoDB] user already in database')
              }
            })
          })
        }
        
        // upload audio file to amazon s3
        uploadS3(audio_id, user_id, filepath).then(onAudioUploaded)

        res.end('{"success" : "Submited new audio", "status" : 200}');
      }
    })
  });
})
// TO DO
app.put('/api/audio', upload.none(), function (req, res) {
  console.log("request body", req.body)
  var audio_data = req.body
  let change = {deleted: audio_data.deleted, disabled: audio_data.disabled, text: audio_data.text}
  // var user_id = req.body.id
  // var lang_code = req.body.languageInput === 'null' ? '' : req.body.languageInput
  // var lang_other = req.body.otherLanguage === 'null' ? '' : req.body.otherLanguage
  // var text = req.body.textInput
  console.log("audio_data", audio_data)
  Audio.findOneAndUpdate({id: audio_data.id}, change, function (err, new_audio_data) {    
    res.json(new_audio_data);
    // res.end('{"success" : "Submited new audio", "status" : 200}');
  });
})

/* -------------------------------------------------
Upload to Amazon S3 storage
---------------------------------------------------*/
const uploadS3 = (audio_id, user_id, filepath) => new Promise((resolve, reject) => {
  var fileStream = fs.createReadStream(filepath);
  var uploadParams = {
    Bucket: S3_BUCKET, 
    Key: `audios/${user_id}/${audio_id}.wav`, 
    Body: fileStream
  }
  // upload to S3
  s3.upload(uploadParams, function(err, data) {
    if (err) {
        reject(err)
        return
    }
    console.log('data', data, err)
    resolve(data.Location)
  });
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