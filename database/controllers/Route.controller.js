const db = require('../../database');
const { bodyInjectionCheck, symbolCheck } = require("../VarChecker");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { uploadImages, uploadFile } = require('../../storage/StorageController');

class RouteController {
    async createRoute(req, res) {
        let title = req.body.title;
        let distance = req.body.distance;
        let time = req.body.time;
        let about = req.body.about;
        let tags = req.body.tags;
        let files = req.files;
        let token = req.cookies.token || "";
        let verified = undefined;
        try{
            verified = jwt.verify(token, process.env.JWT_SECRET);
        }catch(err){
            
        }
        if(verified !== undefined && bodyInjectionCheck(req.body) == "OK"){
            let gpxFile;
            let imageFiles = [];

            files.forEach((file,index) => {
                if(file.originalname === "blob"){
                    file.originalname = new Date().getTime() + "" + index;
                    imageFiles.push(file);
                }else if (file?.originalname?.toString().slice(-3) === "gpx"){
                    gpxFile = file;
                }
            })
            
            const routeQuery = await db.query(`INSERT INTO routes (title,distance,time,about,tags,likes,gpx,images,owner_id) values ('${title}', '${distance}', '${time}', '${about}', '{${tags}}', '{}', '${gpxFile?.originalname || ""}', '{${imageFiles.map(image => '"' + image.originalname + ".jpeg" + '"').toString()}}', '${verified.id}') RETURNING id;`);
            let ID = routeQuery?.rows[0]?.id || "0";
            if (ID !== "0"){
                uploadImages(imageFiles, `img/${ID}/`);
                if(gpxFile !== undefined){
                    uploadFile(gpxFile.buffer, `gpx/${ID}/${title}.gpx`);
                }
                res.json({
                    status: "OK",
                }).end();
            }else{
                res.json({
                    status: "SQL error",
                }).end();
                return;
            }
        }

        res.json({
            status: "AUTH ERROR",
        }).end();
        return;
    }
    async getAllRoutes(req, res) {
        const routeQuery = await db.query(`SELECT * FROM routes;`);
        res.json({
            data: routeQuery.rows
        });
        
    }

    async getAllRoutesCount(req, res) {
        const routeCountQuery = await db.query(`SELECT count(*) FROM routes;`);
        res.json({
            data: routeCountQuery.rows
        });
    }
    

    async getOneRoute(req, res) {
        if(!symbolCheck(req.params.id)){
            const routeQuery = await db.query(`SELECT * FROM routes where ID = '${req.params.id}';`);
            res.json({
                data: routeQuery.rows[0]
            });
        }
    }
    async updateRoute(req, res) {

    }
    async deleteRoute(req, res) {
        if(!symbolCheck(req.params.id)){
            const routeQuery = await db.query(`DELETE FROM routes where ID = '${req.params.id}';`);
            res.json({
                status: routeQuery.rowCount > 0 ? "Removed" : "Not found"
            });
        }
    }

    async routeLike(req,res){
        const routeId = req.body.id;
        let verified = undefined;
        try{
            verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        }catch(err){
            
        }

        if(routeId && !symbolCheck(routeId) && verified){

            const routeLikesQuery = await db.query(`select * from routes where id = ${routeId}`);
            let likeArray = routeLikesQuery.rows[0].likes;
            if(likeArray.includes(verified.id)){
                likeArray = likeArray.filter(likeId => likeId !== verified.id);
            }else{
                likeArray.push(verified.id);
            }
            const updateQuery = await db.query(`UPDATE routes SET likes = '{${likeArray}}' WHERE id = ${routeId};`);
            if(updateQuery){
                res.json({
                    status: "OK",
                })
            }else{
                res.json({
                    status: "Unable to update likes",
                }).end();
            }
        }
    }
}
module.exports = new RouteController();