const { exec } = require('child_process');
const fs = require('fs');

const filename = 'result.json'
const dest_folder = 'public/db/audios'

let json_data = fs.readFileSync('public/db_test/data.json')
let db_data = JSON.parse(json_data)
let audios = db_data.audios

audios.map(audio => {
    console.log("audio", audio)
    fs.copyFile(`public/${audio.file}`, `public/db/max_audios/${audio.id}.wav`, (err) => {
        if (err) {
            console.error("err", err)
        };
        console.log('source.txt was copied to destination.txt');
    });
})