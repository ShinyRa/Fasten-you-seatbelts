const router = require('express').Router();
const {sqlRequest, hashPassword} = require('../misc/utils');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: ':) nothing to see here...',
    port: 465,
    secure: true,
    auth: {
        user: ':) nothing to see here...',
        pass: ':) nothing to see here...'
    }
});

router.post('/sendEmail', (req, res) => {
    sqlRequest("SELECT UserID FROM user WHERE email = '" + req.body.email + "'", (rows) => {
        if (rows.length > 0) {
            let password = '';
            const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            for (let i = 0; i < 12; i++) {
                password += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            const mailOptions = {
                from: 'Corendon Travelbuddies <info@travel-buddies.nl>',
                to: req.body.email,
                subject: "Wachtwoord vergeten Travelbuddies",
                html:   'Geachte heer/mevrouw,<br><br>' +
                        'Wij hebben uw wachtwoord gewijzigd naar een tijdelijk wachtwoord: <b>' + password + '</b><br>' +
                        'Met dit wachtwoord kunt u nu inloggen maar u wordt verzocht dit zo snel mogelijk te wijzigen op uw profielpagina'
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    hashPassword(password, (pass) => {
                        sqlRequest("UPDATE user SET wachtwoord = '" + pass + "' WHERE UserId = " + rows[0].UserID, (rows) => {
                            res.send(req.body.email);
                        });
                    });
                }
            });
        } else {
            res.status(500).send({error: "Er is geen gebruiker geregistreerd met dit emailadres"});
        }
    });
});

module.exports = router;