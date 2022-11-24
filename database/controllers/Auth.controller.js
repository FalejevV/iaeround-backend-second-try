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
            let resLogin = ""
            if(queryResult.rows[0]){
                resLogin=queryResult.rows[0].login;
                const token = jwt.sign({
                    exp:Math.floor(Date.now()/1000)+(60*60*2),
                    data: queryResult.rows[0].login,
                    id: queryResult.rows[0].id,
                },process.env.JWT_SECRET);

                res.cookie('token', token, {sameSite: 'none', secure:'true', httpOnly: true}).json({
                    status:"OK",
                    login:resLogin
                }).end();
                return;
            }else{
                res.json({
                    status:"Wrong login or password",
                }).end();
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
            }).end();
            return;
        }
        db.query(`select * from users where login = '${login}' or email = '${email}'`)
        .then(queryResult=>{
            if(!queryResult.rows[0]){
                db.query(`insert into users (email,name,login,password) values ('${email}', '${login}', '${login}' , crypt('${password}', gen_salt('bf'))) RETURNING login`)
                .then(queryRegisterResponse => {
                    res.json({
                        login:queryRegisterResponse.rows[0].login,
                        status:"OK"
                    }).end();
                    return;
                })
            }else{
                res.json({
                    status: "Login or Email is already used!"
                }).end();
                return;
            }
        });
    }

    async tokenCheck(req,res){
        res.json(req.cookies.token || undefined).end();
        return;
    }

    
    async logoutUser(req,res){
        res.cookie('token', "", {sameSite: 'none', secure:'true', httpOnly: true}).end();
        return;
    }


    async changePassword(req,res){
        let verified = undefined;
        try{
            verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        }catch(err){
            
        }

        if(bodyInjectionCheck(req.body) === "OK" && verified !== undefined){
            let password = req.body.password;
            let repeatPassword = req.body.repeat_password;
            if(password !== undefined && password.trim() !== "" && repeatPassword.trim() !== ""){
                if(password === repeatPassword){
                    let finalQuery = `UPDATE users SET password=crypt('${password}', gen_salt('bf')) WHERE id = '${verified.id}';`;
                    db.query(finalQuery).then(response => {
                        res.status(200).json({status: "OK"}).end();
                    })
                }else{
                    res.status(404).json({status: "Passwords do not match"}).end();
                }
            }
        }
    }

    async changeEmail(req,res){
        let verified = undefined;
        try{
            verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        }catch(err){
            res.status(401).json({status: "Auth error"}).end();
        }

        if(bodyInjectionCheck(req.body) === "OK" && verified !== undefined){
            let email = req.body.email;
            if(email && email.trim() !== ""){
                let emailCheckQuery = `select * from users where id != '${verified.id}' and email='${email}';`;
                db.query(emailCheckQuery).then(result => {
                    if(result.rows.length > 0){
                        res.status(401).json({status: "Email is used on another account"}).end(); 
                    }else{
                        let finalQuery = `UPDATE users SET email='${email}' WHERE id = '${verified.id}';`;
                        db.query(finalQuery).then(secondResponse => {
                            res.status(401).json({status: "OK"}).end(); 
                        })
                    }
                })
            }else{
                res.status(401).json({status: "Email empty"}).end();
            }
        }
    }
}

module.exports = new AuthController();