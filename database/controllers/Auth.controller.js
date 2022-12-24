const db = require('../../database');
const jwt = require('jsonwebtoken');
const { bodyInjectionCheck } = require('../VarChecker');
require('dotenv').config();

class AuthController{

    async login(req,res){
       if(bodyInjectionCheck(req.body) === "OK"){
        res.send({
            status: "OK"
        });
       }else{
            res.send({
                status: "You cannot enter symbols",
            });
       }
    }

    async register(req,res){
        if(bodyInjectionCheck(req.body) === "OK"){
            res.send({
                status: "OK"
            });
        }else{
            res.send({
                status: "You cannot enter symbols",
            });
        }
    }

    async tokenCheck(req,res){
        
    }

    
    async logoutUser(req,res){
       
    }


    async changePassword(req,res){
      
    }

    async changeEmail(req,res){
      
    }
}

module.exports = new AuthController();