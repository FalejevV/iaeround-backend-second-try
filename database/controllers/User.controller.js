const db = require('../../database');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { symbolCheck, bodyInjectionCheck } = require('../VarChecker');
const StorageController = require("../../storage/StorageController");
const JWTSystem = require("../../jwt");
const { clearFolder, uploadFile } = require('../../storage/StorageController');

class UserController{
    async getAllUsers(req, res){

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
      let authToken = req.cookies.IAEToken;
      let verified = JWTSystem.verifyToken(authToken);
        if(bodyInjectionCheck(req.body) === "OK" && verified !== "-1"){
          let avatar = req.file;
          let name = req.body.name;
          let email = req.body.email;
          let about = req.body.about;
          let date = new Date().valueOf();
          let avatarEdit;
          if(name !== undefined && email !== undefined && about !== undefined){
            if(name.trim() !== "" && email.trim() !== "" && about.trim() !== ""){
              if(avatar !== undefined){
                if(avatar.size < 2000000){
                  if(avatar.mimetype.includes('image')){
                    avatarEdit = avatar;
                  }
                }
              }

              let checkTakenEmailQuery = await db.query(`select * from users where email='${email}' and id !='${verified}'`);
              if(checkTakenEmailQuery.rows.length > 0){
                res.send({
                  status:"Emails is taken"
                });
                res.end();
                return;
              }else{
                let uploadFileResult = false;
                if(avatarEdit !== undefined){
                  if(clearFolder(`avatar/${verified}`)){
                    uploadFileResult = await uploadFile(avatarEdit.buffer,`avatar/${verified}/${name+date}.jpeg`);
                  }
                };

                let updateProfileQuery = await db.query(`update users set name='${name}', email='${email}', about='${about}', avatar='${name+date}.jpeg' where id='${verified}' returning *`);
                if(uploadFile && updateProfileQuery.rows[0].id !== undefined){
                  res.cookie('IAEToken',undefined, { maxAge: 300, httpOnly: true, sameSite: 'none', secure: true  });
                  res.cookie('IAEAuth',undefined, { maxAge: 300, sameSite: 'none', secure: true });
                  res.send({
                    status:"OK",
                  });
                  res.end();
                  return;
                }

              }   
              
            }else{
              res.send({
                status:"Fields seem empty :/"
              });
              res.end();
              return;
            }
          }
        }else{
          res.send({
            status:"Forbidden character used in fields"
          });
          res.end();
          return;
        }

        res.send({
          status:"update error"
        });
        res.end();
    }
    async deleteUser(req, res){

    }
    async getUserByToken(req,res){

    }
}

module.exports = new UserController();