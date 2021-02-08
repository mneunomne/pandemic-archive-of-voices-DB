const fs = require('fs');

const filename = 'result.json'
const dest_folder = 'public/db/'
const telegram_data_folder = 'exports/DataExport_2021-01-23/'
const original_audios_folder = 'chats/chat_05/voice_messages'
const dest_audios_folder = 'public/db/audios'
// const { getAudioDurationInSeconds } = require('get-audio-duration');

function getData () {
  let rawdata = fs.readFileSync(telegram_data_folder + filename);
  let telegram_data = JSON.parse(rawdata);

  let audio_texts_pairs = telegram_data.filter(
    m => (m.text === '' && m.media_type === 'voice_message') && m.id !== 3 || m.text !== ''
  )
  
  audio_texts_pairs = audio_texts_pairs
  .map(
    (m, index) => {
      if (m.text !== '' && m.media_type !== 'voice_message') return false
      var { from, from_id, file, id, duration_seconds} = m
      // replace file path for new file path
      let dest_folder = `${dest_audios_folder}/${from_id}`
      file = file.replace('.ogg', '.wav').replace(original_audios_folder, dest_folder)
      let text = audio_texts_pairs[index+1].text
      return {
        from,
        file,
        id,
        text,
        from_id,
        duration_seconds
      }
    }
  ).filter(m => m)

  var speakers = []
  telegram_data.map(m => {
    if (m.from && !speakers.some(s => s.id === m.from_id)) {
      speakers.push({
        "speaker": m.from,
        "id": m.from_id
      })
    }
  } )

  let total_duration = audio_texts_pairs.map(m => m.duration_seconds).reduce((a, b) => a + b, 0)
  return { 
    "db": "The Pandemic Archive of Voices",
    "extracted_on": new Date().toISOString().replace(/T/, '').replace(/\..+/, ''),
    "audios_length": audio_texts_pairs.length,
    "speakers_length": speakers.length,  
    "total_duration_seconds": total_duration,
    "audios": audio_texts_pairs,
    "speakers": speakers
  }
}

let data = JSON.stringify(getData(), null, 4);
fs.writeFileSync(`${dest_folder}/data.json`, data)