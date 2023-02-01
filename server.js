const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();
const rateLimit = require('express-rate-limit');

const app = express();
var cors = require('cors')
const routeRoutes = require("./database/routes/Route.routes");
const userRoutes = require("./database/routes/User.routes");
const tagRoutes = require("./database/routes/Tag.routes");
const authRoutes = require("./database/routes/Auth.routes");

app.use(express.urlencoded({limit: '15mb', extended: false, parameterLimit: 3000000}));
app.use(express.json({limit: '15mb'}));
app.use(cookieParser());

app.use(cors({  
  origin: false ? "https://iaeround.xyz" : "http://localhost:3000",  
  methods: ['GET', 'PUT', 'POST', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization', '*'], 
  credentials: true, 
  exposedHeaders: ['*', 'Authorization' ],
  sameSite: 'none'
}));

const apiLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 15 minutes
	max: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use('/api', apiLimiter)

app.use("/api", routeRoutes);
app.use("/api", userRoutes);
app.use("/api", tagRoutes);
app.use("/api", authRoutes);



app.get('/', function (req, res) {
  res.send("running");
})

app.listen((process.env.PORT || 5000), () => {
  console.log('listening to ' + (process.env.PORT || 5000));
})
