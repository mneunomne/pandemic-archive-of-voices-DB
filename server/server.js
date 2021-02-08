const express = require('express')
const fs = require('fs');

const app = express()

const port = process.env.PORT || 3000

let db_data = fs.readFileSync('db/data.json')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/data', function (req, res) {
  let obj = JSON.parse(db_data);
  res.json(obj);
})

app.get('/speaker_id/:id', function (req, res) {
  let id = parseInt(req.params.id)
  let obj = JSON.parse(db_data);
  let audios = obj.audios.filter(a => {
    return a.from_id === id
  })
  res.json(audios);
})

app.get('/speaker/:name', function (req, res) {
  let name = req.params.name
  let obj = JSON.parse(db_data);
  let audios = obj.audios.filter(a => a.from.toLowerCase().includes(name))
  res.json(audios);
})

app.get('/audio_id/:id', function (req, res) {
  let id = req.params.id
  let obj = JSON.parse(db_data);
  let audio = obj.audios.find(a => a.id === id)
  res.json(audio);
})

app.get('/audio_text/:text', function (req, res) {
  let text = req.params.text
  let obj = JSON.parse(db_data);
  let audios = obj.audios.filter(a => a.text.toLowerCase().includes(text))
  res.json(audios);
})

app.listen(port, (err) => {
  if (err) throw err
  console.log(`Server running in port ${port}`)
})



module.exports = app