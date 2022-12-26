const db = require('../../database');
const { bodyInjectionCheck } = require('../VarChecker');
const JWTSystem = require("../../jwt");

class AuthController{

    async login(req,res){
       if(bodyInjectionCheck(req.body) === "OK"){
            let loginQuery;
            if(req.body.login.includes("@") && false){
                loginQuery = await db.query(`SELECT * FROM users WHERE email = '${req.body.login}' AND password = crypt('${req.body.password}', password);`);
            }else{
                loginQuery = await db.query(`SELECT * FROM users WHERE login = '${req.body.login}' AND password = crypt('${req.body.password}', password);`);
            }
            if(loginQuery && loginQuery.rows[0] && loginQuery.rows[0].id){
                let id = loginQuery.rows[0].id;
                let login = loginQuery.rows[0].login;
                let about = loginQuery.rows[0].about;
                let avatar = loginQuery.rows[0].avatar;
                let name = loginQuery.rows[0].name;
                if(id && login && about && avatar && name){
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

    async changeEmail(req,res){
      
    }
}

module.exports = new AuthController();