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
        
    }

    async updateUser(req, res){
        
    }
    async deleteUser(req, res){

    }
    async getUserByToken(req,res){

    }
}

module.exports = new UserController();