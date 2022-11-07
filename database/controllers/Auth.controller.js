const db = require('../../database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthController{

    async login(req,res){
        const login = req.body.login;
        const password = req.body.password;
        db.query(`select * from users where (login = '${login}' or email = '${login}') and password = crypt('${password}', password)`)
        .then(queryResult=>{
            if(queryResult.rows[0]){
                const token = jwt.sign({
                    exp:Math.floor(Date.now()/1000)+(60*60),
                    data: login,
                },process.env.JWT_SECRET);
                res.cookie('token', JSON.stringify(token), {sameSite: 'none', secure:'true', httpOnly: true});
                res.send({
                    status:"OK",
                    login
                });
                res.end();
            }else{
                res.send({
                    status:"Wrong login or password",
                });
                res.end();
            }
        });
    }

    async register(req,res){
        const login = req.body.login;
        const email = req.body.email;
        const password = req.body.password;

        db.query(`select * from users where login = '${login}' or email = '${email}'`)
        .then(queryResult=>{
            if(!queryResult.rows[0]){
                db.query(`insert into users (email,login,password) values ('${email}', '${login}' , crypt('${password}', gen_salt('bf'))) RETURNING login`)
                .then(queryRegisterResponse => {
                    res.send(queryRegisterResponse);
                })
            }else{
                res.send("Login or email is already used");
            }
        });
    }

    async tokenCheck(req,res){
        res.send(req.cookies.token || undefined);
    }
}

module.exports = new AuthController();