const db = require('../../database');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { symbolCheck, bodyInjectionCheck } = require('../VarChecker');
const StorageController = require("../../storage/StorageController");
const JWTSystem = require("../../jwt");

class UserController{
    async getAllUsers(req, res){

    }

    async uploadFile(filePath) {
        
      }

      

    async getOneUser(req, res){
        let userId = req.params.id;
        if(userId){
          let getUserQuery = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);
          res.send({
            id:getUserQuery.rows[0].id,
            name: getUserQuery.rows[0].name,
            login: getUserQuery.rows[0].login,
            about:getUserQuery.rows[0].about,
            avatar:getUserQuery.rows[0].avatar,
          });
          res.end();
          return;
        }

        res.send({
          name:""
        });
        res.end();
    } 

    async getMe(req,res){
      let authCookie = req.cookies.IAEToken;
      let verified = JWTSystem.verifyToken(authCookie);
      if(verified !== "-1"){
        let getUserQuery = await db.query(`SELECT * FROM users WHERE id = '${verified}'`);
        res.send({
          id:getUserQuery.rows[0].id,
          email:getUserQuery.rows[0].email,
          name: getUserQuery.rows[0].name,
          login: getUserQuery.rows[0].login,
          about:getUserQuery.rows[0].about,
          avatar:getUserQuery.rows[0].avatar,
        });
        res.end();
        return;
      }
      res.send({
        name:""
      });
      res.end();
    }

    async updateUser(req, res){
        
    }
    async deleteUser(req, res){

    }
    async getUserByToken(req,res){

    }
}

module.exports = new UserController();