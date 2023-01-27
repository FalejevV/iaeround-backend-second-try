const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();


let transporter = nodemailer.createTransport({
    host: 'imap.mail.com',
    post: "993",
    secure:true,
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

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          
        } else {
          return true;
        }
    }); 
}

module.exports ={
    sendMail
}