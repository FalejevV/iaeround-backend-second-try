const db = require('../../database');

class TagsController{
    async getAllTags(req,res){
        const tagsQuery = await db.query("SELECT title FROM TAGS");
        res.send(tagsQuery.rows);
    }
}

module.exports = new TagsController();