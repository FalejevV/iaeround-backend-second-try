const Router = require('express');
const router = new Router();
const AuthController = require("../controllers/Auth.controller.js");


router.post("/auth/login", AuthController.login);
router.post("/auth/register", AuthController.register);
router.get("/auth/logout", AuthController.logoutUser);
router.get("/auth/token-check", AuthController.tokenCheck);
router.post("/auth/recover", AuthController.recoverPassword);
router.post("/auth/changepassword", AuthController.changePassword);
router.get("/auth/emailcode", AuthController.getEmailChangeCode);
router.post("/auth/changeemail", AuthController.changeEmail);

module.exports = router;