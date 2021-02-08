const fs = require('fs');
const { exec } = require("child_process");

const filename = 'result.json'
const dest_folder = 'public/db/audios'
const telegram_data_folder = 'exports/DataExport_2021-01-23/'


function convertAudios () {
  let rawdata = fs.readFileSync(telegram_data_folder + filename);
  let telegram_data = JSON.parse(rawdata)
  
  telegram_data.filter(
    m => (m.text === '' && m.media_type === 'voice_message')
  )
  .map((m) => {
    // convert
    let src = m.file
    let dest = m.file.substring(m.file.lastIndexOf('/') + 1).replace('.ogg', '.wav')
    if (!fs.existsSync(`${dest_folder}/${m.from_id}`)){
      fs.mkdirSync(`${dest_folder}/${m.from_id}`);
    }
    // run sox command with opusdev    
    exec(`opusdec --force-wav ${telegram_data_folder}/${src} - | sox - ${dest_folder}/${m.from_id}/${dest} rate 48000`, (error, stdout, stderr) => {
      if (error) {
        console.log(`conversion error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`conversion stderr: ${stderr}`)
      }
    })
  })
}

convertAudios()