const db = require('../../database');
const { bodyInjectionCheck, symbolCheck } = require("../VarChecker");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { uploadImages, uploadFile } = require('../../storage/StorageController');

class RouteController {
    async createRoute(req, res) {

    }
    async getAllRoutes(req, res) {
        let routeQuery = await db.query("SELECT * FROM ROUTES");
        res.send({
            data:routeQuery.rows
        })
        res.end();
    }

    async getOneRoute(req, res) {
        let routeId = req.body.id;
        if (routeId){
            let routeQuery = await db.query("SELECT * FROM ROUTES where id === " + routeId);
            res.send({
                data:routeQuery.rows
            })
            res.end();
        }
    }
    async updateRoute(req, res) {

    }
    async deleteRoute(req, res) {

    }

    async likeRoute(req,res){
        let tokenCookie = req.cookies.IAEToken.substring(1, req.cookies.IAEToken.length-1);
        let verified = undefined;
        try{
            verified = jwt.verify(tokenCookie, process.env.JWT_SECRET);
        }catch(err){
            console.log(err);
        }
        if(!verified){
            res.send({
                status:"You need to login first!"
            });
            res.end();
            return;
        }
        if(bodyInjectionCheck(req.body) === "OK" && verified){
            let action = req.body.action;
            let id = req.body.id;
            if(action && id){
                if(action === "ADD"){
                    let likeQuery = await db.query(`update routes set likes = array_append(likes, '${verified.id}') where id = ${id} returning likes;`);
                    res.send(JSON.stringify({
                        status:"OK",
                        data: likeQuery.rows[0].likes
                    }));
                    res.end();
                    return;
                }else if(action === "REMOVE"){
                    let likeQuery = await db.query(`update routes set likes = array_remove(likes, '${verified.id}') where id = ${id} returning likes;`);
                    console.log(likeQuery);
                    res.send(JSON.stringify({
                        status:"OK",
                        data: likeQuery.rows[0].likes
                    }));
                    res.end();
                    return;
                }
            }
        }
        res.send({
            status:"Error?"
        });
        res.end();
        return;
    }

}
module.exports = new RouteController();