const express = require('express')
const fs = require('fs');

const app = express()

const port = process.env.PORT || 3000

let db_data = fs.readFileSync('public/db/data.json')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('form'))

// POST
app.post('/api/audio', function (req, res) {
    res.status(200)
})

app.listen(port, (err) => {
    if (err) throw err
    console.log(`Server running in port ${port}`)
})
  
module.exports = app