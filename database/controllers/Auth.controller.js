const db = require('../../database');
const jwt = require('jsonwebtoken');
const { bodyInjectionCheck } = require('../VarChecker');
require('dotenv').config();

class AuthController{

    async login(req,res){
        const login = req.body.login;
        const password = req.body.password;
        db.query(`select * from users where (login = '${login}' or email = '${login}') and password = crypt('${password}', password)`)
        .then(queryResult=>{
            if(queryResult.rows[0]){
                const token = jwt.sign({
                    exp:Math.floor(Date.now()/1000)+(60*60*2),
                    data: login,
                },process.env.JWT_SECRET);

                res.cookie('token', token, {sameSite: 'none', secure:'true', httpOnly: true});
                res.json({
                    status:"OK",
                    login
                });
                res.end();
                return;
            }else{
                res.json({
                    status:"Wrong login or password",
                });
                res.end();
                return;
            }
        });
    }

    async register(req,res){
        const login = req.body.login;
        const email = req.body.email;
        const password = req.body.password;
        const bodyCheck = bodyInjectionCheck(req.body);
        if(bodyCheck !== "OK"){
            res.json({
                status: "Please do not use specific characters/symbols",
            });
            res.end();
            return;
        }
        db.query(`select * from users where login = '${login}' or email = '${email}'`)
        .then(queryResult=>{
            if(!queryResult.rows[0]){
                db.query(`insert into users (email,login,password) values ('${email}', '${login}' , crypt('${password}', gen_salt('bf'))) RETURNING login`)
                .then(queryRegisterResponse => {
                    res.json({
                        login:queryRegisterResponse.rows[0].login,
                        status:"OK"
                    });
                    res.end();
                    return;
                })
            }else{
                res.json({
                    status: "Login or Email is already used!"
                });
                res.end();
                return;
            }
        });
    }

    async tokenCheck(req,res){
        res.json(req.cookies.token || undefined);
        return;
    }

    
    async logoutUser(req,res){
        res.cookie('token', "", {sameSite: 'none', secure:'true', httpOnly: true});
        res.end();
        return;
    }

}

module.exports = new AuthController();