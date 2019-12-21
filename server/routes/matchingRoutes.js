const router = require('express').Router();
const {sqlRequest, verifyToken, sendRequest, calcAge} = require('../misc/utils');

//get all matches
router.post('/getMatches/:matchingDest', verifyToken, (req, res) => {
    let userId = req.userId;
    if(userId){
        //Get current User information
        sqlRequest("SELECT * FROM user WHERE UserID = " + userId + " LIMIT 1", (currentUser) => {
            //Search for a general destination
            if(req.params.matchingDest === "general"){
                //Get all users their UserId and Intersts
                sqlRequest("SELECT * FROM user WHERE UserID != " + userId, (users) => {
                    //Caluclate mutual interest
                    calcMutualInterests(currentUser, users, (matchingResults) => {
                        //Sort results on matchingPrecent
                        res.json(matchingResults.sort((a, b) => parseFloat(b.matchingPrecent) - parseFloat(a.matchingPrecent)));
                    });
                });
            }

            //Search for a specific destination
            else{
                //Get users with the same specific destination their UserId and Interests
                sqlRequest("SELECT * FROM user INNER JOIN reis on user.UserID=reis.userID where reis.locatie = '" + req.params.matchingDest + "' AND user.UserID != " + userId, (users) => {
                    //Caluclate mutual interest
                    calcMutualInterests(currentUser, users, (matchingResults) => {
                        //Sort results on matchingPrecent
                        res.json(matchingResults.sort((a, b) => parseFloat(b.matchingPrecent) - parseFloat(a.matchingPrecent)));
                    });

                    if(users.length === 0){
                        res.json([]);
                    }
                });
            }
        });
    }
});

function calcMutualInterests(currentUser, users, callback) {
    //Check if potentialMatches are already matched
    potentialMatches(currentUser[0].UserID, users, (result) => {
        //Matching results
        let matchingResults = [];

        //Loop over all potential matches
        for (let i = 0; i < result.length; i++) {
            let user = result[i];
            //Check mutual interest
            checkMutualInterests(currentUser[0], user, (count) => {
                let promise = new Promise(function(resolve, reject) {
                    const url = "http://geodata.nationaalgeoregister.nl/locatieserver/free?fq=postcode:" + user.postcode;

                    sendRequest(url, (res) => {
                        resolve(res.response.docs[0] ? res.response.docs[0].weergavenaam : undefined);
                    });
                });

                let interestsAmount = JSON.parse(currentUser[0].interesses)
                    ? JSON.parse(currentUser[0].interesses).length
                    : 0;
                let name =
                    user.voornaam
                    + " "
                    + (user.tussenvoegsel
                    ? user.tussenvoegsel + " "
                    : "")
                    + user.achternaam;

                //Push user information and matchingPrecent to mutualResults array
                promise.then((res) => {
                    matchingResults.push({
                        "userId": user.UserID,
                        "matchingPrecent": (count / (interestsAmount / 100)),
                        "name": name,
                        "age": calcAge(user.geboortedatum),
                        "profilePicture": (user.profielfoto) ? './Resources/Img/Uploads/user_' + user.UserID + '/' + user.profielfoto : './Resources/Img/default_profile.jpg',
                        "location": user.locatie ? user.locatie : undefined,
                        "startDate": user.begin_reis ? user.begin_reis : undefined,
                        "endDate": user.eind_reis ? user.eind_reis : undefined,
                        "adres" : res
                    });
                }).then(() => {
                    if(matchingResults.length === result.length){
                        callback(matchingResults);
                    }
                })
            });
        }

        if(result.length === 0){
            callback(matchingResults);
        }
    });
}

function potentialMatches(userId1, userId2, callback){
    let potentialMatches = [];
    let counter = 0;

    //Loop over all potentialMatches
    for (let i = 0; i < userId2.length; i++) {
        let user = userId2[i];

        //Check if their already matched
        sqlRequest("SELECT * FROM user INNER JOIN matching ON user.UserID = matching.User1 OR user.UserID = matching.User2 WHERE (matching.User1 = " + userId1 + " OR matching.User2 = " + userId1 + ") AND (matching.User1 = " + user.UserID + " OR matching.User2 = " + user.UserID + ")", (data) => {
            counter++;

            if(data){
                //If no results push user to potentialMatches
                if(data.length === 0){
                    potentialMatches.push(user);
                }

                //If last loop of for loop callback all potentialMatches
                if(counter === userId2.length){
                    callback(potentialMatches);
                }
            }
        });

    }
}

function checkMutualInterests(user, aUser, callback) {
    //Mutual score counter
    let mutualInterestCounter = 0;
    let aUserInterests;
    let userInterests;

    //Check if other user has interesses
    if(Array.isArray(aUser.interesses)){
        aUserInterests = JSON.parse(aUser.interesses);
    }
    //Else split on , 's (This will give empty array if null)
    else{
        aUserInterests = JSON.parse(aUser.interesses.split(','));
    }

    //Check if current user has interesses
    if(Array.isArray(JSON.parse(user.interesses))){
        userInterests = JSON.parse(user.interesses);
    }
    //Else split on , 's (This will give empty array if null)
    else{
        userInterests = JSON.parse(user.interesses.splice(','));
    }

    //Check if interests are not null
    if(aUserInterests !== null){
        //Loop over all interests
        for (let i = 0; i < aUserInterests.length; i++) {
            //loop over all current user interests and check if they are mutual
            for (let j = 0; j < userInterests.length; j++) {
                let randomUserInterest = aUserInterests[i];
                let currentUserInterest = userInterests[j];

                //If mutual add 1 to mutual counter
                if (randomUserInterest === currentUserInterest) {
                    mutualInterestCounter++;
                }
            }
        }
    }

    callback(mutualInterestCounter);
}

//Add match route
router.post('/addMatch', verifyToken, (req, res) => {
    let userId = req.userId;

    //Insert userId's into matching table
    sqlRequest("INSERT INTO fys_is106_2.matching (matching.User1, matching.User2, matching.matchingStatus) VALUES ("+ userId +", " + req.body.userId2 + ", " + req.body.action + ");", (data) => {
        if(data){
            //If rows are affected send a succes message
            if(data.affectedRows > 0){
                res.status(200).send("Added match");
            }
            //else send error message
            else{
                res.status(500).send("Something went wrong");
            }
        }
        else{
            res.status(500).send("Something went wrong");
        }
    });
});

//Get match
router.post('/getMatch', verifyToken, (req, res) => {
    let userId = req.userId;
    sqlRequest("SELECT * FROM matching WHERE (User1 = " + userId + " OR User2 = " + userId + ") AND (User1 = " + req.body.partnerId + " OR User2 = " + req.body.partnerId + ") AND (matchingStatus = 2)", (data) => {
        if (data[0]) {
            res.json(data[0]);
        } else {
            res.status(500).send('No matches found');
        }
    });
});

//Set match status to 0
router.post('/deleteMatch', verifyToken, (req, res) => {
    let userId = req.userId;
    sqlRequest("UPDATE matching SET matchingStatus = 0 WHERE (User1 = " + userId + " OR User2 = " + userId + ") AND (User1 = " + req.body.partnerId + " OR User2 = " + req.body.partnerId + ") AND (matchingStatus = 2)", (data) => {
        res.json(data);
    });
});

module.exports = router;
