const router = require('express').Router();
const bodyParser = require('body-parser');

const {sqlRequest, verifyToken} = require('../misc/utils');

//je kan deze line weg halen sinds ik body parser in de main server file aangeef @22
router.use(bodyParser.json());

router.post('/getChat',verifyToken, (req, res) => {
    sqlRequest("SELECT MatchID FROM matching WHERE User1 = '"+req.userId+"' AND User2 = '"+req.body.partnerid+"' ", (result) => {
      if(Object.keys(result).length){
        res.json({result, userId: req.userId});
      }else{
        sqlRequest("SELECT MatchID FROM matching WHERE User1 = '"+req.body.partnerid+"' AND User2 = '"+req.userId+"' ", (result) => {
          res.json({result, userId: req.userId});
        });
      }
    });
});

router.post('/getMessage', (req, res) => {
    sqlRequest("SELECT * FROM message WHERE MatchID = '"+req.body.MatchID+"'", (result) => {
        res.json(result);
    });
});

router.post('/getMatches', verifyToken, (req, res) => {
    sqlRequest("SELECT * FROM matching WHERE( User1 = '"+req.userId+"' OR User2 = '"+req.userId+"') AND matchingStatus = 2 ", (result) => {
        res.json({result, userId: req.userId});
    });
});

router.post('/getMatchesEnd',(req, res) => {
  sqlRequest("SELECT UserID, voornaam, profielfoto FROM user WHERE UserID = '" + req.body.partnerid + "' ", (result_end) => {
       res.json({result_end, userId: req.userId, partnerid: req.body.partnerid});
  });
});
router.post('/saveMessage',verifyToken,(req, res) => {
  sqlRequest("INSERT INTO message (bericht, MatchID, SenderID, verstuur_datum) VALUES('"+ req.body.message +"', "+ req.body.Matchid +", "+ req.userId +", NOW())" , (result_end) => {
      res.json();
  });
});
router.post('/getmyid',verifyToken,(req, res) => {
  res.json({userId: req.userId});
});
module.exports = router;
