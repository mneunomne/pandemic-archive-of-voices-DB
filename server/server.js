/* -------------------------------------------------
Database API The Pandemic Archive of Voices
Developed by Alberto Harres @ HfK Bremen, 2020-2021
---------------------------------------------------*/

const express = require('express')
const path = require('path');
const fs = require('fs')
const cors = require('cors')
const multer = require('multer')
const marked = require('marked')
const { exec } = require("child_process")
const { getAudioDurationInSeconds } = require('get-audio-duration')
require('dotenv').config()
const upload = multer();
const app = express()
const http = require('http')
const https = require('https')
const mongoose = require ("mongoose")
var aws = require('aws-sdk');
const WaveFile = require('wavefile').WaveFile;
const request = require('request');

/* -------------------------------------------------
Global vars
---------------------------------------------------*/
const port = process.env.PORT || 3000
const dest_folder = `public/db`
var server = null
const S3_BUCKET = process.env.S3_BUCKET;

const alphabet = "撒健億媒間増感察総負街時哭병体封列効你老呆安发は切짜확로감外年와모ゼДが占乜산今もれすRビコたテパアEスどバウПm가бうクん스РりwАêãХйてシжغõ小éजভकöলレ入धबलخFসeवমوযиथशkحくúoनবएদYンदnuনمッьノкتبهtт一ادіاгرزरjvةзنLxっzэTपнлçşčतلイयしяトüषখথhцहیরこñóহリअعसमペيフdォドрごыСいگдとナZকইм三ョ나gшマで시Sقに口س介Иظ뉴そキやズВ자ص兮ض코격ダるなф리Юめき宅お世吃ま来店呼설진음염론波密怪殺第断態閉粛遇罩孽關警"

const default_sample_rate = 8000
const default_bits = "8"

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

// MongoDB Audio Schema 
const Audio = mongoose.model('Audio', mongoose.Schema({
    id: String,
    name: String,
    path: String,
    text: String,
    user_id: String,
    duration: Number,
    disabled: Boolean,
    deleted: Boolean,
    lang: Object,
    timestamp: Number
}));

// MongoDB User Schema 
const User = mongoose.model('User', mongoose.Schema({
    name: String,
    id: String
}));

/* -------------------------------------------------
Start http(s) server
---------------------------------------------------*/

if (process.env.LOCAL == "1") {
  // LOCAL ENV
  server = http.Server({maxHeaderSize: 16384}, app)
  console.log("Created HTTP Server!", process.env.LOCAL)
} else {
  // REMOTE ENV
  server = http.Server({maxHeaderSize: 16384}, app)
  // server = https.Server(app)
  //console.log("Created HTTPS Server!", process.env.LOCAL)
}

/* -------------------------------------------------
Generate README html 
---------------------------------------------------*/
var readMe = fs.readFileSync('README.md', 'utf-8');
var markdownReadMe = marked(readMe);
markdownReadMe = markdownReadMe.concat(`<style>body { font-family: 'Courier New'; }</style>`)
fs.writeFileSync('./public/README.html', markdownReadMe);

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
  console.log("mongoConnected", mongoConnected)
  if (!mongoConnected) {
    res.status(503).send('Ufff: MongoDb not loaded yet');
    return
  }
  // dont return the audios with "deleted==true"
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
  User.find({}, function (err, users) {
    if (err) console.error(err)
    res.json(users)
  })
})

// get audios from speaker id
app.get('/speaker_id/:id', function (req, res) {
  let user_id = req.params.id
  const query = { 'user_id': user_id };
  Audio.find(query, function (err, audios) {
    if (err) console.error(err)
    res.json(audios)
  })
})

// get audios from speaker from speaker name (contains)
app.get('/api/speaker/:name', function (req, res) {
  let name = req.params.name.toLowerCase()
  const query = { "name": new RegExp(name, 'i') }
  Audio.find(query, function (err, audios) {
    if (err) console.error(err)
    res.json(audios)
  })
})

// get single audio from audio id
app.get('/api/audio_id/:id', function (req, res) {
  let audio_id = req.params.id
  const query = { "id": audio_id }
  Audio.findOne(query, function (err, audio) {
    if (err) console.error(err)
    res.json(audio)
  })
})

app.get('/api/audio_text/:text', function (req, res) {
  let text = req.params.text
  const query = { "name": new RegExp(text, 'i') }
  Audio.find(query, function (err, audios) {
    if (err) console.error(err)
    res.json(audios)
  })
})

// Get sample array from audio id
app.get('/api/get_audio_samples/:audio_id/:bits/:sample_rate', function (req, res) {
  var bits = req.params.bits || 8
  var sample_rate = req.params.sample_rate || default_sample_rate  
  var audio_id = req.params.audio_id
  // get audio data from MongoDB
  const query = { "id": audio_id }
  Audio.findOne(query, function (err, audio) {
    if (err || audio == null) {
      console.error(err)
      res.status(400).send("Audio not found")
    }
    // download audio file from S3 Amazon
    https.get(audio.path, (result) => {
      var data = [];
      result.on('data', (chunk) => {
        data.push(chunk);
      }).on('end', function() {
        let wavBuffer = getWavBufferFromAudioData(data, bits, sample_rate) 
        res.json(wavBuffer)
      });
    }).on('error', (e) => {
      console.error(e);
      res.status(500)
    });
  })
})


// Get sample array from audio id as text based on alphabet encryption
app.get('/api/get_audio_samples_characters/:audio_id/:bits/:sample_rate', function (req, res) {
  var bits = req.params.bits || default_bits
  var sample_rate = req.params.sample_rate || default_sample_rate  
  var audio_id = req.params.audio_id

  const query = { "id": audio_id }
  Audio.findOne(query, function (err, audio) {
    if (err || audio == null) {
      console.error(err)
      res.status(400).send("Audio not found")
    }
    // download audio file from S3 Amazon
    https.get(audio.path, (result) => {
      var data = [];
      result.on('data', (chunk) => {
        data.push(chunk);
      }).on('end', function() {
        let wavBuffer = getWavBufferFromAudioData(data, bits, sample_rate) 
        var characters = ""
        for (var i in wavBuffer) {
          characters += alphabet.charAt(wavBuffer[i])
        }
        res.json(characters)
      });
    }).on('error', (e) => {
      console.error(e);
      res.status(500)
    });
  })
})

// get compressed audio file
app.get('/api/get_compressed_audio_file/:audio_id/:bits/:sample_rate', function (req, res) {
  var bits = req.params.bits || 8
  var sample_rate = req.params.sample_rate || default_sample_rate  
  var audio_id = req.params.audio_id
  const query = { "id": audio_id }
  Audio.findOne(query, function (err, audio) {
    if (err || audio == null) {
      console.error(err)
      res.status(400).send("Audio not found")
    }
    // download audio file from S3 Amazon
    https.get(audio.path, (result) => {
      var data = [];
      result.on('data', (chunk) => {
        data.push(chunk);
      }).on('end', function() {
        let wavBuffer = getWavBufferFromAudioData(data, bits, sample_rate) 
        fs.writeFileSync("temp/audio.wav", wavBuffer);
        res.setHeader('Content-type', "audio/wav");
        res.sendFile(path.resolve('temp/audio.wav'));
      });
    }).on('error', (e) => {
      console.error(e);
      res.status(500)
    });
  })
})


// generate audio file from int array 
app.get('/api/gen_audio_from_samples/:bits/:sample_rate', function (req, res) {
  var samples = req.params.samples || [128]
  var bits = (req.params.bits || default_bits) + ""
  var sample_rate = req.params.sample_rate || default_sample_rate 

  var wav = new WaveFile();
  // Create a WaveFile using the samples
  wav.fromScratch(1, sample_rate, bits, samples);
  
  fs.writeFileSync("public/temp/audio.wav", wav.toBuffer());
  res.setHeader('Content-type', "audio/wav");
  res.sendFile(path.resolve('public/temp/audio.wav'));
})

// generate audio file from string array 
app.get('/api/gen_audio_from_text', function (req, res) {
  var text = req.body.text || "" 
  console.log("text", text)
  var samples = text.split("").map(c => alphabet.indexOf(c))
  var wav = new WaveFile();
  // Create a WaveFile using the samples
  wav.fromScratch(1, default_sample_rate, default_bits, samples);
  // send file back
  fs.writeFileSync("public/temp/audio.wav", wav.toBuffer());
  res.setHeader('Content-type', "audio/wav");
  res.sendFile(path.resolve('public/temp/audio.wav'));
})

/* -------------------------------------------------
Helper functions for the waveform processing business
---------------------------------------------------*/

const getWavBufferFromAudioData = (data, bits, sample_rate) => {
  var buffer = Buffer.concat(data);
  // Load a wav file buffer as a WaveFile object
  let wav = new WaveFile(buffer);
  // set Sample rate and bit rate
  wav.toSampleRate(sample_rate);
  wav.toBitDepth(bits + "");
  // Check some of the file properties
  return wav.toBuffer();
}
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
  var timestamp = req.body.timestamp

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
  var base64data = audioBlob.split(",")[1]
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
              user_id: user_id + "", // mega installation hack "dxUu2RI0"
              duration: duration,
              disabled: false,
              deleted: false,
              timestamp: timestamp,
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
                  io.emit("new_audio", {id: audio_id});
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

/* -------------------------------------------------
update new audio to the datase 
---------------------------------------------------*/
app.put('/api/audio', upload.none(), function (req, res) {
  var audio_data = req.body
  let change = {deleted: audio_data.deleted, disabled: audio_data.disabled, text: audio_data.text}
  console.log("audio_data", audio_data)
  // update OR create audio in MongoDB 
  Audio.findOneAndUpdate({id: audio_data.id}, change, function (err, new_audio_data) {    
    io.emit("update_audio", {id: audio_data.id});
    res.json(new_audio_data);
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