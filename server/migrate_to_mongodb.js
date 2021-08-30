const { ConnectContactLens } = require("aws-sdk");
const mongoose = require ("mongoose")
require('dotenv').config()
const fs = require('fs')

var db_json = fs.readFileSync('public/db/data.json')
var db_data = JSON.parse(db_json)

const mongoUri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOSTNAME}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;

const Audio = mongoose.model('Audio_test', mongoose.Schema({
    id: String,
    name: String,
    path: String,
    text: String,
    user_id: String,
    duration: Number,
    lang: Object
}));

const User = mongoose.model('User_test', mongoose.Schema({
    name: String,
    id: String
}));
  
mongoose.connect(mongoUri, { useNewUrlParser: true }, function (err, res) {    
    if (err) {
        console.error(err)
        throw err
    }
    db_data.audios.map((audio) => {
        return new Audio({
            id: audio.id + "",
            name: audio.from,
            path: audio.file.replace("db", "https://archive-of-voices.s3.eu-central-1.amazonaws.com"),
            text: audio.text,
            user_id: audio.from_id + "",
            duration: audio.duration_seconds,
            lang: audio.lang
        }).save(function (err) {
            if (err) return console.error(err);
            console.log(`saved to ${audio.id} database!`,)
        });
    })

    db_data.speakers.map((user) => {
        return new User({
            name: user.speaker,
            id: user.id + ""
        }).save(function (err) {
            if (err) return console.error(err);
            console.log(`saved to ${user.id} database!`,)
        });
    })
})