const db = require('../../database');

class AuthController{
    async login(req,res){
        res.send("LOGGING IN");
    }

    async register(req,res){
        res.send("REGISTERING");
    }

    async tokenCheck(req,res){
        res.send("TOKEN CHECK");
    }
}

module.exports = new AuthController();