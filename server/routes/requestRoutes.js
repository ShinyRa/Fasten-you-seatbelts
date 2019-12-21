const router = require('express').Router();
const {sqlRequest, verifyToken, sendRequest, calcAge} = require('../misc/utils');

router.post('/getRequests', verifyToken, (req, res) => {
    let userId = req.userId;

    sqlRequest("SELECT * FROM matching INNER JOIN user ON user.UserID = matching.User1 WHERE matching.matchingStatus = 1 AND User2 = " + userId, (data) => {
        if (data) {
            for (let i = 0; i < data.length; i++) {
                let user = data[i];

                user.name =
                    user.voornaam
                    + " "
                    + (user.tussenvoegsel
                    ? user.tussenvoegsel + " "
                    : "")
                    + user.achternaam;
                user.age = calcAge(user.geboortedatum);
                user.userId = user.UserID;
                user.profilePicture = (user.profielfoto) ? './Resources/Img/Uploads/user_' + user.UserID + '/' + user.profielfoto : './Resources/Img/default_profile.jpg'
            }

            res.json(data);
        }
    });
});

router.post('/updateRequest', verifyToken, (req, res) => {
    let userId = req.userId;

    // 0 = Match Denied
    // 1 = User1 asked User2 to be friend
    // 2 = User2 Accepted User1

    sqlRequest("UPDATE matching SET matchingStatus = " + req.body.action + " where MatchID = " + req.body.matchId, (data) => {
        if (data) {
            res.json(data);
        }
    });
});

module.exports = router;