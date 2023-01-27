const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();


let transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: process.env.MAIL_LOGIN,
      pass: process.env.MAIL_PASSWORD
    }
});


async function sendMail(to, subject, text){
    let mailOptions = {
        from: process.env.MAIL_LOGIN,
        to: to,
        subject: subject,
        text: text
    };
    return new Promise((resolve,reject)=>{transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log("error is "+error);
           resolve(false); // or use rejcet(false) but then you will have to handle errors
        } 
       else {
           resolve(true);
        }
    });
    });
}

module.exports ={
    sendMail
}