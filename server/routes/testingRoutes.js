const router = require('express').Router();

const {hashPassword, comparePassword, sqlRequest, verifyToken} = require('../misc/utils');


router.get('/testing', (req, res) => {
    res.send("Connection");
});

router.get('/testingSql', (req, res) => {
    sqlRequest("select * from user", (result) => {
        res.send(result);
    });
});

module.exports = router;