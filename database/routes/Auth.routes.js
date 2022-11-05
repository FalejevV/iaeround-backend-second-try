const Router = require('express');
const router = new Router();
const AuthController = require("../controllers/Auth.controller.js");


router.post("/auth/login", AuthController.login);
router.post("/auth/register", AuthController.register);
router.get("/auth/token", AuthController.tokenCheck);

module.exports = router;