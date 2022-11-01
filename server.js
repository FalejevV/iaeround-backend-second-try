const express = require('express');

const app = express();
const pg = require("./database");
app.get('/', function (req, res) {
  res.send('Hello World')
  pg.query("select * from routes").then(res => console.log(res.rows));
})

app.listen(3000);
