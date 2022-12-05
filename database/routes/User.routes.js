const Router = require('express');
const router = new Router();
const UserController = require ('../controllers/User.controller.js');
const multer = require('multer');
var storage = multer.memoryStorage(); 
var upload = multer({ storage: storage });

router.post("/user", UserController.createUser);
router.get("/user", UserController.getAllUsers);
router.get("/user/:id", UserController.getOneUser);
router.get("/usertoken", UserController.getUserByToken);
router.post("/user/profilechange",upload.single('avatar'), UserController.updateUser);
router.delete("/user/:id", UserController.deleteUser);


module.exports = router;