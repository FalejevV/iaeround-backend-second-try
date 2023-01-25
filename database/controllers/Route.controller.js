const db = require('../../database');
const { bodyInjectionCheck, symbolCheck } = require("../VarChecker");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { uploadImages, uploadFile, removeFile, clearFolder } = require('../../storage/StorageController');
const JWTSystem = require("../../jwt");

class RouteController {
    async createRoute(req, res) {
        let cookieToken = req.cookies.IAEToken;
        let verified = JWTSystem.verifyToken(cookieToken);
        if(verified === "-1"){
            res.send({
                status:"Auth error. Try to relogin"
            });
            res.end();
            return;
        }

        let rowsCounterQuery = await db.query('select count(*) from routes');
        if(rowsCounterQuery && rowsCounterQuery.rows && rowsCounterQuery.rows[0].count){
            if(parseInt(rowsCounterQuery.rows[0].count) > 150){
                res.send({
                    status:"Max route count on website is reached. (Max 150 routes)"
                });
                res.end();
                return;
            }
        }else{
            res.send({
                status:"Database request error. (count(*))"
            });
            res.end();
            return;
        }
        if(bodyInjectionCheck(req.body) === "OK"){
            let title = req.body.title;
            let distance = req.body.distance;
            let time = req.body.time;
            let about = req.body.about;
            let gpxFile = "";
            let imageFiles = [];
            let imageFileNames = [];
            let tags = req.body.tags.split(',');
            let tagsFormatted = [];

            // Seperate files. chech for GPX file, and for Images
            if(req.files.files.length >= 2){
                Array.from(req.files.files).forEach((file,index) => {
                        if(file.originalname.substring(file.originalname.length -3, file.originalname.length) === "gpx"){
                            file.originalname = title + ".gpx";
                            gpxFile = file;
                        }else if (file.mimetype.includes("image") || file.mimetype.includes("octet-stream")){
                            file.originalname = title+ new Date().valueOf() + index;
                            imageFileNames.push(`"${file.originalname}.jpeg"`);
                            imageFiles.push(file);
                        }
                });
                if(req.files.thumbnail.length > 0){
                    let file = req.files.thumbnail[0];
                    file.originalname = "0" + title+ new Date().valueOf();
                    imageFileNames.unshift(`"${file.originalname}.jpeg"`);
                    imageFiles.unshift(file);
                }else{
                    res.send({
                        status:"Please select title"
                    });
                    res.end();
                    return;
                }
            }else{
                res.send({
                    status:"Please upload minimum 2 images. (5 max)"
                });
                res.end();
                return;
            }
            
            // Changing tags, surrounding them with "" for query insert
            tags.forEach(tag => {
                tagsFormatted.push(`"${tag}"`);
            });
            if(tagsFormatted.length < 2 || tagsFormatted.length > 4){
                res.send({
                    status:"Please select 2-4 tags",
                })
                res.end();
                return;
            }

            // Date for query insert
            let date = new Date().toISOString().slice(0, 10);

            let createRouteQuery = await db.query(`INSERT into routes (title,distance,time, about,gpx,images,owner_id,tags,likes,date) values('${title}', '${distance}', '${time}', '${about}', '${gpxFile.originalname || " "}', '{${imageFileNames}}' , '${verified}', '{${tagsFormatted}}', '{}', '${date}') returning *;`);
                let uploadError = false;
                if(createRouteQuery.rows[0].gpx.trim() !== ""){
                    let gpxUpload = uploadFile(gpxFile.buffer, `gpx/${createRouteQuery.rows[0].id}/${createRouteQuery.rows[0].gpx}`);
                    if(gpxUpload === false){
                        uploadError = true;
                    }
                }

                createRouteQuery.rows[0].images.forEach((textImage,index) => {
                    if(uploadError){
                        return;
                    }

                    let imageUpload = uploadFile(imageFiles[index].buffer, `img/${createRouteQuery.rows[0].id}/${textImage}`);
                    if(imageUpload === false){
                        uploadError = true;
                    }
                });

                if(uploadError === false){
                    res.send({
                        status:"OK",
                        id: createRouteQuery.rows[0].id
                    });
                    res.end();
                    return;
                }else{
                    db.query(`DELETE from routes where id =${createRouteQuery.rows[0].id}`);
                    clearFolder(`img/${createRouteQuery.rows[0].id}`);
                    clearFolder(`gpx/${createRouteQuery.rows[0].id}`);
                    res.send({
                        status:"Failed to upload files. Route creation failed.",
                    });
                    res.end();
                    return;
                }
        }
        res.send("OK");
        res.end();
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
                        clearFolder(`img/${req.params.id}`);
                        clearFolder(`gpx/${req.params.id}`);
                        res.send({
                            status:"OK"
                        });
                        res.end();
                        return;
                    };
                    
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