const Router = require('express');
const router = new Router();
const TagsController = require('../controllers/Tags.controller');


router.get("/tags", TagsController.getAllTags);

module.exports = router;