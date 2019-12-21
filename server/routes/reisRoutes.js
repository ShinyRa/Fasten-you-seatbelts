const router = require('express').Router();

const {sqlRequest, verifyToken} = require('../misc/utils');

//Insert a new trip into the database
router.post('/addReis', verifyToken, (req, res) => {
    const query =
        "INSERT INTO reis (begin_reis, eind_reis, locatie, userID) " +
        "VALUES ('" +
            req.body.begin_reis + "', '" +
            req.body.eind_reis + "', '" +
            req.body.locatie + "', '" +
            req.userId +
        "');";
    sqlRequest(query, (rows) => {
        res.json(rows);
    });
});

//Get trips from the database
router.post('/getReizen', verifyToken, (req, res) => {
    const query = "SELECT * FROM reis WHERE userID = " + req.userId;
    sqlRequest(query, (rows) => {
        res.json(rows);
    });
});

//Remove trip
router.post('/deleteReis', verifyToken, (req, res) => {
    const query = "DELETE FROM reis WHERE ReisID = " + req.body.ReisID + " AND userID = " + req.userId;
    sqlRequest(query, (rows) => {
        res.json(rows);
    });
});

//Get partner trips
router.post('/getPartnerReizen', (req, res) => {
    sqlRequest("SELECT begin_reis, eind_reis, locatie FROM reis WHERE UserID = " + req.body.partnerId, (result) => {
        res.json(result);
    });
});

module.exports = router;