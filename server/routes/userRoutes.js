const router = require('express').Router();
const mkdirp = require('mkdirp');

const {sqlRequest, verifyToken} = require('../misc/utils');

//Get user
router.post('/getUser', verifyToken, (req, res) => {
    sqlRequest("SELECT * FROM user WHERE UserID = " + req.userId, (result) => {
        res.json(result[0]);
    });
});

//Update user
router.post('/updateUser', verifyToken, (req, res) => {
    let query = '';
    switch (req.body.type) {
        case 'PersonalInfo':
            query =
                "UPDATE user " +
                "SET voornaam = '" + req.body.voornaam + "', " +
                "tussenvoegsel = '" + req.body.tussenvoegsel + "', " +
                "achternaam = '" + req.body.achternaam + "', " +
                "geboortedatum = '" + req.body.geboortedatum + "', " +
                "adres = '" + req.body.adres + "', " +
                "postcode = '" + req.body.postcode + "', " +
                "email = '" + req.body.email + "', " +
                "telefoonnummer = '" + req.body.telefoonnummer + "' " +
                "WHERE UserId = " + req.userId;
            break;
        case 'PersonalPreferences':
            query =
                "UPDATE user " +
                "SET beschrijving = '" + req.body.beschrijving + "', " +
                "interesses = '" + JSON.stringify(req.body.interesses) + "' " +
                "WHERE UserId = " + req.userId;
            break;
    }
    sqlRequest(query, (rows) => {
        res.json(rows);
    });
});

//Delete user (set user inactive)
router.post('/deleteUser', verifyToken, (req, res) => {
    sqlRequest("UPDATE user SET active = 0 WHERE UserId = " + req.userId, (result) => {
        res.json(result);
    });
});

//Upload picture
router.post('/uploadPicture', verifyToken, (req, res) => {
    const path = '..' + (req.body.server ? '/../www' : '/client') + '/Resources/Img/Uploads/user_' + req.userId;
    let picture = req.files.file;

    mkdirp(path, function(err) {
        picture.mv(path + '/' + picture.name, function(error) {
            if (error) {
                res.status(500).send(error);
            } else {
                sqlRequest("UPDATE user SET profielfoto = '" + picture.name + "' WHERE UserId = " + req.userId, (result) => {
                    res.send('Profielfoto geüpload!');
                });
            }
        });
    });
});

//Get picture
router.post('/getPicture', verifyToken, (req, res) => {
    sqlRequest("SELECT UserID, profielfoto FROM user WHERE UserID = " + req.userId, (result) => {
        res.json(result);
    });
});

//Get partner
router.post('/getPartner', (req, res) => {
    let query =
        "SELECT " +
        "UserID, " +
        "voornaam, " +
        "tussenvoegsel, " +
        "achternaam, " +
        "geboortedatum, " +
        "adres, " +
        "postcode, " +
        "email, " +
        "telefoonnummer, " +
        "beschrijving, " +
        "interesses, " +
        "profielfoto " +
        "FROM user WHERE UserID = " + req.body.partnerId;
    sqlRequest(query, (result) => {
        res.json(result[0]);
    });
});

module.exports = router;
