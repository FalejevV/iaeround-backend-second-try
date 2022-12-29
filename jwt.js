const jwt = require('jsonwebtoken');
require('dotenv').config();

class JWTSystem{
    sign(data){
        return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '14400s' });
    }

    verifyToken(cookie){
        try{
            verified = jwt.verify(cookie, process.env.JWT_SECRET);
        }catch(err){
            console.log(err);
        }
        if(verified !== undefined){
            return verified;
        }
    }
}


module.exports = new JWTSystem();