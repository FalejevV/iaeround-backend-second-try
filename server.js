const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
var cors = require('cors')
const routeRoutes = require("./database/routes/Route.routes");
const userRoutes = require("./database/routes/User.routes");
const tagRoutes = require("./database/routes/Tag.routes");

app.use(express.json());
app.use(cors());
app.use("/api", routeRoutes);
app.use("/api", userRoutes);
app.use("/api", tagRoutes);



app.get('/', function (req, res) {
  res.send("running");
})


app.use('/storage', express.static('storage'))

app.listen(process.env.PORT, () => {
  console.log('listen');
})
