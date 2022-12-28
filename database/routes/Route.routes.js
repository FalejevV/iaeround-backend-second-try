const Router = require('express');
const router = new Router();
const RouteController = require('../controllers/Route.controller');
const multer = require('multer');
var storage = multer.memoryStorage(); 
var upload = multer({ storage: storage });

router.post("/route", upload.array('files',10),  RouteController.createRoute);
router.get("/routes", RouteController.getAllRoutes);
router.get("/route/:id", RouteController.getOneRoute);
router.put("/route", RouteController.updateRoute);
router.delete("/route/:id", RouteController.deleteRoute);
router.post("/route/routelike", RouteController.likeRoute)

module.exports = router;