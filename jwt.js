const jwt = require('jsonwebtoken');
require('dotenv').config();

class JWTSystem{
    sign(data){
        return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '14400s' });
    }

    verifyToken(cookie){
        let tokenCookie = cookie.substring(1, cookie.length-1);
        let verified = undefined;
        try{
            verified = jwt.verify(tokenCookie, process.env.JWT_SECRET);
        }catch(err){
            console.log(err);
        }
        if(verified !== undefined){
            return verified.id;
        }
        return "-1";
    }
}


module.exports = new JWTSystem();