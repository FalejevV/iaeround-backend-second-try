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
                loginQuery = await db.query(`SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);`,[req.body.login,req.body.password]);
            }else{
                loginQuery = await db.query(`SELECT * FROM users WHERE login = $1 AND password = crypt($2, password);`,[req.body.login,req.body.password]);
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
            const checkIfExistsQuery = await db.query(`SELECT * from users where login = $1 or email = $2`,[login,email]);
            if(checkIfExistsQuery.rows.length > 0){
                res.send({
                    status: "Login or email is already in use",
                }); 
                return;
            }else{
                const createUserQuery = await db.query(`INSERT into users (email,login,password,name) values ($1, $2, crypt($3, gen_salt('bf')), '${login}') returning *`,[email,login,password]);
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
        let cookieToken = req.cookies.IAEToken;
        let verified = JWTSystem.verifyToken(cookieToken);
        if(verified === "-1"){
            res.send({
                status:"Auth error. Try to relogin"
            });
            res.end();
            return;
        }

        let oldPassword = req.body.oldP;
        let newPassword = req.body.newP;
        let repeatPassword = req.body.repeatP;

        if(oldPassword !== undefined && newPassword !== undefined && repeatPassword !== undefined){
            let checkForPassword = await db.query(`select * from users where id=$1 AND password = crypt($2, password);`,[verified,oldPassword]);
            if(checkForPassword?.rows[0]?.id !== undefined){
                let passwordChangeQuery = await db.query(`update users set password = crypt($1, gen_salt('bf')) where id=$2 returning *`,[newPassword,checkForPassword?.rows[0]?.id]);
                if(passwordChangeQuery?.rows[0]?.id !== undefined){
                    res.cookie('IAEToken',undefined, { maxAge: 300, httpOnly: true, sameSite: 'none', secure: true  });
                    res.cookie('IAEAuth',undefined, { maxAge: 300, sameSite: 'none', secure: true });
                    res.send({
                        status:`OK`
                    });
                    res.end();
                    return;
                }else{
                    res.send({
                        status:`Database query error. Please try again after couple minutes`
                    });
                    res.end();
                    return;
                }
                
            }else{
                res.send({
                    status:`Old password is wrong`
                });
                res.end();
                return;
            }
        }
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
            res.send({
                status:"Invalid email"
            });
            res.end();
            return;
        }

        if(recoverQuery && recoverQuery.rows[0] && recoverQuery.rows !== undefined){
            if(recoverQuery.rows[0].id){
                let tempPassword = "iae"+(new Date().valueOf())+"round";
                let passwordChangeQuery = await db.query(`update users set password = crypt($1, gen_salt('bf')) where id=$2 returning *`,[tempPassword,recoverQuery.rows[0].id]);
                if(passwordChangeQuery && passwordChangeQuery.rows[0] && passwordChangeQuery.rows !== undefined){
                    let emailing = false;
                    try{
                        emailing = await sendMail(
                            passwordChangeQuery.rows[0].email,
                            "IAEround password recovery",`
                            Your temporary password is:  ${tempPassword} Please change it in profile settings page`);
                    }catch(err){
                        console.log("EMAIL ERROR", err);
                    }
                    if(emailing){
                        res.send({
                            status:`New password has been sent to email ***${passwordChangeQuery.rows[0].email.substring(3,passwordChangeQuery.rows[0].email.length)}`
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

    async getEmailChangeCode(req,res){
        let cookieToken = req.cookies.IAEToken;
        let verified = JWTSystem.verifyToken(cookieToken);
        if(verified === "-1"){
            res.send({
                status:"Auth error. Try to relogin"
            });
            res.end();
            return;
        }

        let dateValue = new Date().valueOf().toString();
        let code = dateValue.substring(dateValue.length-6, dateValue.length);

        let sendCodeGetUserQuery = await db.query(`update users set emailchangekey = $1 where id=$2 returning *`,[code,verified]);
        if(sendCodeGetUserQuery?.rows[0]?.emailchangekey !== undefined){
            if(sendMail(sendCodeGetUserQuery.rows[0].email,"Email change", `Email change comfirmation code: ${code}`)){
                res.send({
                    status:`Confirmation code has been sent to ***${sendCodeGetUserQuery.rows[0].email.substring(3,sendCodeGetUserQuery.rows[0].email.length)}`
                });
                res.end();
                return;
            }else{
                res.send({
                    status:"Error. Email was not sent"
                });
                res.end();
                return;
            }
        }

        res.send({
            status:"Error. Please try again later"
        });
        res.end();
        return;
    }

    async changeEmail(req,res){
        let cookieToken = req.cookies.IAEToken;
        let verified = JWTSystem.verifyToken(cookieToken);
        if(verified === "-1"){
            res.send({
                status:"Auth error. Try to relogin"
            });
            res.end();
            return;
        }

        if(bodyInjectionCheck(req.body) !== "OK"){
            res.send({
                status:"Forgidden symbols used"
            }).end();
            return;
        }

        let newEmail = req.body.email;
        let code = req.body.code;
        if(newEmail !== undefined && code !== undefined){
            let checkEmailTakenQuery = await db.query(`select * from users where email=$1`,[newEmail]);
            let codeCheck = await db.query(`select * from users where id=$1 and emailchangekey=$2;`,[verified,code]);
            if(checkEmailTakenQuery?.rows.length === 0 && codeCheck?.rows[0]?.id !== undefined){
                let emailChangeQuery = await db.query(`update users set email=$1 where id=$2 and emailchangekey=$3 returning *`,[newEmail,verified,code]);
                if(emailChangeQuery?.rows[0]?.email !== undefined){
                    res.cookie('IAEToken',undefined, { maxAge: 300, httpOnly: true, sameSite: 'none', secure: true });
                    res.cookie('IAEAuth',undefined, { maxAge: 300, sameSite: 'none', secure: true });
                    res.send({
                        status:`OK`,
                        text:`Email has been changed to ${newEmail} please relogin!`
                    }).end();
                    return;
                }
            }
            if(codeCheck?.rows[0]?.id === undefined){
                res.send({
                    status:"Wrong code"
                }).end();
                return;
            }
            if(checkEmailTakenQuery?.rows[0].id !== undefined){
                res.send({
                    status:"Email is already taken"
                }).end();
                return;
            }
        }

        res.send({
            status:"Fetching error"
        }).end();
        return;
    }
}

module.exports = new AuthController();