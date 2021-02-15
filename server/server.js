const express = require('express')
const fs = require('fs');
const marked = require('marked');

const app = express()

const port = process.env.PORT || 3000

// generate readme html
var readMe = fs.readFileSync('README.md', 'utf-8');
var markdownReadMe = marked(readMe);

markdownReadMe = markdownReadMe.concat(`<style>body { font-family: 'Courier New'; }</style>`)

fs.writeFileSync('./public/README.html', markdownReadMe);

let db_data = fs.readFileSync('public/db/data.json')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/api/data', function (req, res) {
  let obj = JSON.parse(db_data);
  res.json(obj);
})

app.get('/api/speakers', function (req, res) {
  let obj = JSON.parse(db_data);
  res.json(obj.speakers);
})

app.get('/speaker_id/:id', function (req, res) {
  let id = parseInt(req.params.id)
  let obj = JSON.parse(db_data);
  let audios = obj.audios.filter(a => {
    return a.from_id === id
  })
  res.json(audios);
})

app.get('/api/speaker/:name', function (req, res) {
  let name = req.params.name.toLowerCase()
  let obj = JSON.parse(db_data);
  let audios = obj.audios.filter(a => a.from.toLowerCase().includes(name))
  res.json(audios);
})

app.get('/api/audio_id/:id', function (req, res) {
  let id = req.params.id
  let obj = JSON.parse(db_data);
  let audio = obj.audios.find(a => a.id === id)
  res.json(audio);
})

app.get('/api/audio_text/:text', function (req, res) {
  let text = req.params.text
  let obj = JSON.parse(db_data);
  let audios = obj.audios.filter(a => a.text.toLowerCase().includes(text))
  res.json(audios);
})

app.get('/api/audio_lang_name/:lang_name', function (req, res) {
  let lang_name = req.params.lang_name
  let obj = JSON.parse(db_data);
  let audios = obj.audios.filter(a => a.lang.name.toLowerCase().includes(lang_name))
  res.json(audios);
})

app.get('/api/audio_lang_code/:lang_code', function (req, res) {
  let lang_code = req.params.lang_code
  let obj = JSON.parse(db_data);
  let audios = obj.audios.filter(a => a.lang.code.toLowerCase().includes(lang_code))
  res.json(audios);
})

app.use(express.static('public'))

app.listen(port, (err) => {
  if (err) throw err
  console.log(`Server running in port ${port}`)
})



module.exports = app