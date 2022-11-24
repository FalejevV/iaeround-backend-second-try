const db = require('../../database');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { symbolCheck, bodyInjectionCheck } = require('../VarChecker');

class UserController{
    async createUser(req, res){
        //const {login, name, about, email, password} = req.body;
        //const newPerson = await db.query(`INSERT INTO users (id,login,name,about,email,password) values ('${nanoid()}', '${login}', '${name}', '${about}', '${email}', '${password}')`);
    }
    async getAllUsers(req, res){

    }
    async getOneUser(req, res){
        const user_data = await db.query(`select * from users where (id = '${req.params.id}');`).then(res => res.rows[0]);
        const likes = await db.query(`select * from routes where '${req.params.id}'=any(likes)`).then(res => res.rows);
        const routes = await db.query(`select * from routes where owner_id = ${req.params.id}`).then(res => res.rows);
        let verified = undefined;
        try{
            verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        }catch(err){
            
        }

        res.json({
            user_data: {
                id: user_data.id,
                login : user_data.login,
                name : user_data.name,
                email: user_data.email,
                about: user_data.about,
                avatar: user_data.avatar,
            },
            likes,
            routes,
            myLogin: verified?.data || undefined
        }).end();
    }

    async updateUser(req, res){
        let verified = undefined;
        try{
            verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        }catch(err){
            res.status(404).json({status: "Auth error"}).end();
        }

        if(verified){
            var Jimp = require('jimp');
            let file = req.file;
            let name = req.body.name;
            let about = req.body.about;
            if(name.trim() === "" && about.trim() === ""){
                res.status(404).json({status: "Fields seem empty"}).end();
            }
            if(symbolCheck(name) || symbolCheck(about)){
                res.status(404).json({status: "Symbols are not alowed"}).end();
            }

            if(file){
                if(file.size > 1000000){
                    res.status(400).json({status: "File is too big"}).end();
                    return;
                }
                
                Jimp.read(file.path, (err, image) => {
                    if (err) throw err;
                    image
                      .quality(80)
                      .write(`storage/avatar/${verified.id}.jpeg`);
                  });
                
            }

            let finalQuery = `UPDATE users SET name='${name}', about='${about}', avatar='${verified.id}.jpeg' WHERE id = '${verified.id}';`;
            db.query(finalQuery).then(resp => {
                res.status(200).json({status: "OK"}).end();
            });

        }else{
            res.status(401).json({status: "Auth error"}).end();
        }
    }
    async deleteUser(req, res){

    }
    async getUserByToken(req,res){
        if(!req.cookies.token || req.cookies.token === ""){
            res.status(404).json({status: "Auth error"}).end();
            return;
        }

        let verified = undefined;
        try{
            verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        }catch(err){
            res.status(404).json({status: "Auth error"}).end();
        }
        if(verified !== undefined && verified.data){
            db.query(`select *  from users where (login = '${verified.data}');`)
            .then(queryResponse => {
                if(queryResponse.rows[0]){
                    res.json({
                        id: queryResponse.rows[0].id,
                        login: queryResponse.rows[0].login,
                        email: queryResponse.rows[0].email,
                        avatar: queryResponse.rows[0].avatar,
                        about : queryResponse.rows[0].about,
                        name: queryResponse.rows[0].name
                    });
                    return;
                }
            });
        }else{   
            res.status(404).json({status: "Auth error"}).end();
            return;
        }

    }
}

module.exports = new UserController();