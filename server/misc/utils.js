const bcrypt = require('bcrypt-nodejs');
const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const request = require('request');

const connection = mysql.createPool({
    connectionLimit : 1,
    host     : ':) nothing to see here...',
    user     : ':) nothing to see here...',
    password : ':) nothing to see here...',
    database : ':) nothing to see here...',
    dateStrings : 'date'
});

module.exports = {
    calcAge: function(birthday){
        birthday = new Date(birthday);

        let ageDifMs = Date.now() - birthday.getTime();
        let ageDate = new Date(ageDifMs);

        return Math.abs(ageDate.getUTCFullYear() - 1970);
    },
    sendRequest: function(url, callback){
        const options = {
            url: url,
            json: true
        };

        request.get(options, (err, response, body) => {
            if(err) throw err;
            callback(body);
        })

    },
    hashPassword: function (password, callback) {
        try{
            bcrypt.hash(password, null, null, (err, hash) => {
                if(err) throw err;
                callback(hash);
            });
        }
        catch(err){
            console.log(err);
        }
    },
    comparePassword: function (password, hash, callback) {
        bcrypt.compare(password, hash, (err, res) => {
            if (err) throw err;
            callback(res);
        });
    },
    sqlRequest: function (query, callback) {
        connection.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query(query,(err, rows, fields) => {
                    connection.release();

                    if (err) console.log(err);
                    callback(rows);
                });
        });
    },
    verifyToken: function(req, res, callback){
        jwt.verify(req.body.token, "yC#+J`34bKtC4H;D", (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                req.userId = authData.userId;
                callback();
            }
        });
    }
};
