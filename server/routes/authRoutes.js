const router = require('express').Router();
const jwt = require('jsonwebtoken');
const {hashPassword, comparePassword, sqlRequest, verifyToken} = require('../misc/utils');

router.post('/register', (req, res) => {
    if (req.body.password === req.body.passwordRepeat) {
        const query = "SELECT UserID, gebruikersnaam, email FROM user WHERE gebruikersnaam = '" + req.body.username + "'";
        sqlRequest(query, (rows) => {
            if (rows.length > 0) {
                res.status(500).send({error: "Deze gebruiker heeft zich al geregistreerd"});
            } else {
                hashPassword(req.body.password, (password) => {
                    const query =
                        "INSERT INTO user (voornaam, tussenvoegsel, achternaam, geboortedatum, adres, postcode, email, telefoonnummer, interesses, gebruikersnaam, wachtwoord) " +
                        "VALUES ('" +
                        req.body.firstname + "', '" +
                        req.body.middlename + "', '" +
                        req.body.lastname + "', '" +
                        req.body.birthdate + "', '" +
                        req.body.address + "', '" +
                        req.body.postcode + "', '" +
                        req.body.email + "', '" +
                        req.body.telefoonnummer + "', '" +
                        JSON.stringify(req.body.interests) + "', '" +
                        req.body.username + "', '" +
                        password +
                        "');";
                    sqlRequest(query, (rows) => {
                        res.json(rows);
                    });
                });
            }
        });
    } else {
        res.status(500).send({error: "Wachtwoorden zijn niet gelijk aan elkaar"});
    }
});

router.post('/login', (req, res) => {
    const query = "SELECT UserId, gebruikersnaam, wachtwoord, active FROM user WHERE gebruikersnaam = '" + req.body.username + "'";
    sqlRequest(query, (rows) => {
        if (rows[0] && rows[0].active === 1) {
            comparePassword(req.body.password, rows[0].wachtwoord, (valid) => {
                if (valid) {
                    const user = {
                        userId: rows[0].UserId,
                        username: rows[0].gebruikersnaam
                    };

                    jwt.sign(user, ':)', (err, token) => {
                        res.json({
                            token
                        });
                    });
                } else {
                    res.status(500).send({error: "Het ingevoerde wachtwoord is onjuist"});
                }
            });
        } else {
            res.status(500).send({error: "Deze gebruiker bestaat niet"});
        }
    });
});

router.post('/changePassword', verifyToken, (req, res) => {
    if (req.body.wachtwoord_profile === req.body.wachtwoord_herhalen) {
        if (req.body.wachtwoord_profile !== '' && req.body.wachtwoord_herhalen !== '') {
            hashPassword(req.body.wachtwoord_profile, (password) => {
                sqlRequest("UPDATE user SET wachtwoord = '" + password + "' WHERE UserId = " + req.userId, (rows) => {
                    res.json(rows);
                });
            });
        } else {
            res.status(500).send({error: "De wachtwoorden zijn leeg, probeer het opnieuw"});
        }
    } else {
        res.status(500).send({error: "Wachtwoorden zijn niet gelijk aan elkaar, probeer het opnieuw"});
    }
});

router.post('/authenticate', verifyToken, (req, res) => {
    res.json(req.userId);
});

module.exports = router;
