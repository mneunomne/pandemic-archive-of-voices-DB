const express = require('express')
var cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const { exec } = require("child_process");
const { getAudioDurationInSeconds } = require('get-audio-duration');


const upload = multer();
const app = express()
const dest_folder = `public/${process.env.DEST_FOLDER}`

const port = process.env.PORT || 3000

let json_data = fs.readFileSync('public/db_test/data.json')
let db_data = JSON.parse(json_data)

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('form'))


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

// POST
app.post('/api/audio', upload.none(), function (req, res) {
    console.log("request body", req.body)
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

    if ((lang_code === null || lang_code === undefined || lang_code === '') && (lang_other === null || lang_other === undefined || lang_other === '') ) {
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
    var timestamp = Date.now()
    var userFolder = `${dest_folder}/audios/${userId}`
    // create the user folder if needed
    if (!fs.existsSync(userFolder)){
        fs.mkdirSync(userFolder);
    }
    
    var filepath_tmp=`${userFolder}/${timestamp}_tmp.wav`
    var filepath = `${userFolder}/${timestamp}.wav`
    fs.writeFile(filepath_tmp, base64data, {encoding: 'base64'}, function(err) {
        console.log('File created');
        // convert audio file
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
                    // language
                    var audio_id = makeid(8)
                    
                    writeData({
                        name: "",
                        user_id: userId,
                        filepath: filepath,
                        id: audio_id,
                        text: text,
                        duration_seconds: duration,
                        lang_code: lang_code,
                        lang_other: lang_other,
                    })

                    // res.status(200)
                    res.end('{"success" : "Submited new audio", "status" : 200}');
                });

            }
        })
    });
})

const writeData = function (data) {
    console.log('data', data)
    
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
            "standard":""
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

    let json_data = JSON.stringify(db_data, null, 4);
    fs.writeFileSync(`${dest_folder}/data.json`, json_data)
}

app.listen(port, (err) => {
    if (err) throw err
    console.log(`Server running in port ${port}`)
})
  
module.exports = app