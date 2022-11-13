const Router = require('express');
const router = new Router();
const RouteController = require('../controllers/Route.controller');


router.post("/route", RouteController.createRoute);
router.get("/route", RouteController.getAllRoutes);
router.get("/routes/:limit", RouteController.getAllRoutesLimit);
router.get("/routes/:limit/:sort", RouteController.getAllRoutesLimitAndSort);
router.get("/routes/:limit/:sort/:search", RouteController.getAllRoutesLimitAndSearch);
router.get("/route/:id", RouteController.getOneRoute);
router.put("/route", RouteController.updateRoute);
router.delete("/route/:id", RouteController.deleteRoute);
router.get("/routecount", RouteController.getAllRoutesCount);
router.get("/routecountsearch/:search", RouteController.getSearchRoutesCount);


module.exports = router;