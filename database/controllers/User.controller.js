const db = require('../../database');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { symbolCheck, bodyInjectionCheck } = require('../VarChecker');
const StorageController = require("../../storage/StorageController");


class UserController{
    async getAllUsers(req, res){

    }

    async uploadFile(filePath) {
        
      }

      

    async getOneUser(req, res){
        let userId = req.params.id;
        if(userId){
          let getUserQuery = await db.query(`SELECT name FROM users WHERE id = '${userId}'`);
          res.send({
            name: getUserQuery.rows[0].name
          });
          res.end();
          return;
        }

        res.send({
          name:"..."
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