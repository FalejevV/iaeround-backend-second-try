const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const pg = require("./database");


app.get('/', function (req, res) {
  res.send("running");
})

app.get('/test', function (req, res) {
  pg.query("select now()").then(data => {
    res.send(data.rows);
  });
})



app.listen(process.env.PORT, () => {
  console.log('listen');
})
