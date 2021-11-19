const fs = require('fs');

const dest_folder = 'public/db/max_audios'

let json_data = fs.readFileSync('public/db/data.json')
let db_data = JSON.parse(json_data)
let audios = db_data.audios

audios.map(audio => {
    console.log("audio", audio)
    fs.copyFile(`public/${audio.file}`, `${dest_folder}/${audio.id}.wav`, (err) => {
        if (err) {
            console.error("err", err)
        };
        console.log('source.txt was copied to destination.txt');
    });
})