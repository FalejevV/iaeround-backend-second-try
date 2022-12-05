const Router = require('express');
const router = new Router();
const RouteController = require('../controllers/Route.controller');
const multer = require('multer');
const upload = multer({ dest: './tmp' });

router.post("/route", upload.array('files', 10),  RouteController.createRoute);
router.get("/route", RouteController.getAllRoutes);
router.get("/route/:id", RouteController.getOneRoute);
router.put("/route", RouteController.updateRoute);
router.delete("/route/:id", RouteController.deleteRoute);
router.get("/routecount", RouteController.getAllRoutesCount);
router.post("/routelike", RouteController.routeLike);

module.exports = router;