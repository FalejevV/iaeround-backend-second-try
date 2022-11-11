const db = require('../../database');
const jwt = require('jsonwebtoken');
require('dotenv').config();


class UserController{
    async createUser(req, res){
        //const {login, name, about, email, password} = req.body;
        //const newPerson = await db.query(`INSERT INTO users (id,login,name,about,email,password) values ('${nanoid()}', '${login}', '${name}', '${about}', '${email}', '${password}')`);
    }
    async getAllUsers(req, res){

    }
    async getOneUser(req, res){
        const user_data = await db.query(`select *  from users where (id = '${req.params.id}');`).then(res => res.rows[0]);
        const likes = await db.query(`select * from routes where '${req.params.id}'=any(likes)`).then(res => res.rows);
        const routes = await db.query(`select * from routes where owner_id = ${req.params.id}`).then(res => res.rows);
        let verified = undefined;
        try{
            verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        }catch(err){
            
        }

        res.json({
            user_data,
            likes,
            routes,
            myLogin: verified?.data || undefined
        })

    }
    async updateUser(req, res){

    }
    async deleteUser(req, res){

    }
    async getUserByToken(req,res){
        if(!req.cookies.token || req.cookies.token === ""){
            res.send("");
            res.end("");
            return;
        }

        let verified = undefined;
        try{
            verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        }catch(err){
            
        }
        if(verified && verified.data){
            db.query(`select *  from users where (login = '${verified.data}');`)
            .then(queryResponse => {
                if(queryResponse.rows[0]){
                    res.json({
                        id: queryResponse.rows[0].id,
                        login: queryResponse.rows[0].login,
                        email: queryResponse.rows[0].email,
                        avatar: queryResponse.rows[0].avatar,
                        about : queryResponse.rows[0].about
                    });
                    return;
                }
            });
        }else{   
            res.status(401).send("").end();
            return;
        }

    }
}

module.exports = new UserController();