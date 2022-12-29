const Router = require('express');
const router = new Router();
const AuthController = require("../controllers/Auth.controller.js");


router.post("/auth/login", AuthController.login);
router.post("/auth/register", AuthController.register);
router.get("/auth/logout", AuthController.logoutUser);
router.get("/auth/tokenCheck", AuthController.tokenCheck);

module.exports = router;