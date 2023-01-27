const db = require('../../database');
const { bodyInjectionCheck } = require('../VarChecker');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWTSystem = require("../../jwt");
const { sendMail } = require('../../mailer');

class AuthController{

    async login(req,res){
       if(bodyInjectionCheck(req.body) === "OK"){
            let loginQuery;
            if(req.body.login.includes("@")){
                loginQuery = await db.query(`SELECT * FROM users WHERE email = '${req.body.login}' AND password = crypt('${req.body.password}', password);`);
            }else{
                loginQuery = await db.query(`SELECT * FROM users WHERE login = '${req.body.login}' AND password = crypt('${req.body.password}', password);`);
            }
            if(loginQuery && loginQuery.rows[0] && loginQuery.rows[0].id){
                let id = loginQuery.rows[0].id;
                let login = loginQuery.rows[0].login;
                let about = loginQuery.rows[0].about;
                let avatar = loginQuery.rows[0].avatar || "";
                let name = loginQuery.rows[0].name;
                if(id && login && about && name){
                    let data = {
                        id,
                        login,
                        about,
                        avatar,
                        name
                    }
                    let token = JWTSystem.sign(data);
                    res.cookie('IAEToken',JSON.stringify(token), { maxAge: 4 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true  });
                    res.cookie('IAEAuth',JSON.stringify(data), { maxAge: 4 * 60 * 60 * 1000, sameSite: 'none', secure: true });
                    res.send({
                        user: data,
                        status: "OK",
                    });
                    res.end();
                    return;
                }else{
                    res.send({
                        status: "Login or password is incorrect",
                    });
                    return;
                }
            }else{
                res.send({
                    status: "Login or password is incorrect",
                });
                return;
            }
            
       }else{
            res.send({
                status: "You cannot enter symbols",
            });
            return;
       }
    }

    async register(req,res){
        if(bodyInjectionCheck(req.body) === "OK"){
            let login = req.body.login;
            let password = req.body.password;
            let rpassword = req.body.rpassword;
            let email = req.body.email;
            if (password !== rpassword){
                res.send({
                    status: "Passwords do not match",
                });
                res.end();
                return; 
            }
            const checkIfExistsQuery = await db.query(`SELECT * from users where login = '${login}' or email = '${email}'`);
            if(checkIfExistsQuery.rows.length > 0){
                res.send({
                    status: "Login or email is already in use",
                }); 
                return;
            }else{
                const createUserQuery = await db.query(`INSERT into users (email,login,password,name) values ('${email}', '${login}', crypt('${password}', gen_salt('bf')), '${login}') returning *`);
                if(createUserQuery.rows.length > 0){
                    res.send({
                        status: "OK",
                    });
                    res.end();
                    return;
                }
            }
        }else{
            res.send({
                status: "You cannot enter symbols",
            });
            res.end();
            return;
        }
    }

    async tokenCheck(req,res){
        let tokenCookie = req.cookies.IAEToken;
        if(tokenCookie && tokenCookie !== undefined){
            let verified = JWTSystem.verifyToken(tokenCookie);
            if(verified !== undefined){
                res.send({
                    id:verified,
                }).end();
                return;
            }
        }
        res.send({
            id:undefined
        });
        res.end();
        return;
    }

    
    async logoutUser(req,res){
        res.cookie('IAEToken',undefined, { maxAge: 300, httpOnly: true, sameSite: 'none', secure: true  });
        res.cookie('IAEAuth',undefined, { maxAge: 300, sameSite: 'none', secure: true });
        res.send({
            status: "OK"
        });
        res.end();
    }


    async changePassword(req,res){
      
    }

    async recoverPassword(req,res){
        if(bodyInjectionCheck(req.body) !== "OK"){
            res.send({
                status:"Forbidden symbols used"
            });
            res.end();
            return;
        }

        let emailOrLogin = req.body.login;

        if(emailOrLogin.trim() === ""){
            res.send({
                status:"Provided data is empty"
            });
            res.end();
            return;
        }
        let recoverQuery;
        if(emailOrLogin.includes("@")){
            recoverQuery = await db.query(`SELECT * FROM users WHERE email = '${emailOrLogin}'`);
        }else{
            recoverQuery = await db.query(`SELECT * FROM users WHERE login = '${emailOrLogin}'`);
        }

        if(recoverQuery && recoverQuery.rows[0] && recoverQuery.rows !== undefined){
            if(recoverQuery.rows[0].id){
                let tempPassword = "iae"+(new Date().valueOf())+"round";
                let emailing = false;
                try{
                    emailing = await sendMail('vovan123123@gmail.com',"test",`Your temporary password is:${tempPassword}. Please change it in profile settings page`);
                }catch(err){
                    console.log("EMAIL ERROR", err);
                }

                if(emailing){
                    res.send({
                        status:"SENT"
                    });
                    res.end();
                    return;
                }else{
                    res.send({
                        status:"ERROR"
                    });
                    res.end();
                    return;
                }
            }
        }else{
            res.send({
                status:"User not found"
            });
            res.end();
            return;
        }


        res.send({
            status:"OK"
        });
        res.end();
    }
}

module.exports = new AuthController();