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

        const verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        if(verified){
            db.query(`select *  from users where (login = '${verified.data}');`)
            .then(queryResponse => {
                if(queryResponse.rows[0]){
                    res.end(JSON.stringify({
                        login: queryResponse.rows[0].login,
                        email: queryResponse.rows[0].email,
                        avatar: queryResponse.rows[0].avatar,
                        about : queryResponse.rows[0].about
                    }));
                }
            });
        }else{   
            res.status(401).send("").end();
        }

    }
}

module.exports = new UserController();