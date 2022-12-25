const jwt = require('jsonwebtoken');
require('dotenv').config();

class JWTSystem{
    sign(data){
        return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '14400s' });
    }
}


module.exports = new JWTSystem();