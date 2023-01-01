const db = require('../../database');
const { bodyInjectionCheck, symbolCheck } = require("../VarChecker");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { uploadImages, uploadFile } = require('../../storage/StorageController');
const JWTSystem = require("../../jwt");

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
        let routeId = req.params.id;
        if (routeId){
            let routeQuery = await db.query(`SELECT * FROM ROUTES where id = '${routeId}';`);
            res.send({
                data:routeQuery.rows[0]
            })
            res.end();
        }
    }
    async updateRoute(req, res) {
        let authCookie = req.cookies.IAEToken;
        let verified = JWTSystem.verifyToken(authCookie);
        if(bodyInjectionCheck(req.body) === "OK"){
            let id = req.body.id;
            let title = req.body.title;
            let distance = req.body.distance;
            let time = req.body.time;
            let about = req.body.about;
            let tags = req.body.tags;
            if(id !== undefined && title !== undefined && distance !== undefined && time !== undefined && about !== undefined && tags !== undefined){
                if(id.trim() !== "" && title.trim !== "" && distance.trim !== "" && time.trim !== "" && about.trim !== "" && tags.length >= 2 && tags.length <=4){
                    let getRouteQuery = await db.query(`select owner_id from routes where id='${id}'`);
                    if(getRouteQuery.rows && getRouteQuery.rows[0].owner_id){
                        if(getRouteQuery.rows[0].owner_id !== verified){
                            res.send({
                                status:"You are not the owner of this route (Try to relogin)"
                            });
                            res.end();
                            return;
                        }
                    }

                    let updateFetch = await db.query(`update routes set title='${title}', distance='${distance}', time='${time}', about='${about}', tags='{${tags}}' where id='${id}' returning id`);
                    if(updateFetch.rows[0].id === id){
                        res.send({
                            status:"OK"
                        });
                        res.end();
                        return;
                    }else{
                        res.send({
                            status:"Error accuired updating route"
                        });
                        res.end();
                        return;
                    }
                }
            }
        }else{
            res.send({
                status:"You have entered forbidden symbols"
            });
            res.end();
            return;
        }
    }
    async deleteRoute(req, res) {
        let authCookie = req.cookies.IAEToken;
        let verified = JWTSystem.verifyToken(authCookie);
        let id = req.params.id;
        if(id && id.trim() !== "" && verified !== undefined){
            if(verified === "-1"){
                res.send({
                    status:"You need to login!"
                });
                res.end();
                return;
            }
            
            let getRouteOwner = await db.query(`SELECT owner_id from routes WHERE id='${id}'`);
            if(getRouteOwner.rows && getRouteOwner.rows[0].owner_id){
                if(getRouteOwner.rows[0].owner_id === verified){
                    let removeQuery = await db.query(`DELETE from routes where id='${id}' RETURNING id`);
                    if(removeQuery.rows[0].id === id){
                        res.send({
                            status:"OK"
                        });
                        res.end();
                        return;
                    }
                }else{
                    res.send({
                        status:"You cannot remove rotes you dont own!"
                    });
                    res.end();
                    return;
                }
            }
        }
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