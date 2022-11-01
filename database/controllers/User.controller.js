const db = require('../../database');

class UserController{
    async createUser(req, res){
        //const {login, name, about, email, password} = req.body;
        //const newPerson = await db.query(`INSERT INTO users (id,login,name,about,email,password) values ('${nanoid()}', '${login}', '${name}', '${about}', '${email}', '${password}')`);
    }
    async getAllUsers(req, res){

    }
    async getOneUser(req, res){

    }
    async updateUser(req, res){

    }
    async deleteUser(req, res){

    }
}

module.exports = new UserController();