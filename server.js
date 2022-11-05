const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();

const app = express();
var cors = require('cors')
const routeRoutes = require("./database/routes/Route.routes");
const userRoutes = require("./database/routes/User.routes");
const tagRoutes = require("./database/routes/Tag.routes");
const authRoutes = require("./database/routes/Auth.routes");

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/api", routeRoutes);
app.use("/api", userRoutes);
app.use("/api", tagRoutes);
app.use("/api", authRoutes);



app.get('/', function (req, res) {
  res.send("running");
})


app.use('/storage', express.static('storage'))

app.listen((process.env.PORT || 3000), () => {
  console.log('listening to ' + (process.env.PORT || 3000));
})
