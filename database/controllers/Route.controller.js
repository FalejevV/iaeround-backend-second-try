const db = require('../../database');
const { bodyInjectionCheck, symbolCheck } = require("../VarChecker");
require('dotenv').config();
const jwt = require('jsonwebtoken');

class RouteController {
    async createRoute(req, res) {
        console.log(req.body);
        /*
        if(injectionCheckResult === "OK"){
            res.send("OK");
        }else{
            console.log(injectionCheckResult);
            res.status(401);
            res.send(injectionCheckResult + " <-- wrong input");
        }
        */
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
                })
            }
        }
    }
}
module.exports = new RouteController();