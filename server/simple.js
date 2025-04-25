const express = require('express');
const path = require('path');

const app = express();
const PORT = 5555;

// Serve files from the 'pybkliuc' directory
app.use(express.static('public'))

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});