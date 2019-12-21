const express = require('express');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

//Import express routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const testingRoutes = require('./routes/testingRoutes');
const reisRoutes = require('./routes/reisRoutes');
const requestRoutes = require('./routes/requestRoutes');
const emailRoutes = require('./routes/emailRoutes');

//Server port
const port = process.env.PORT || 1337
const app = express();

//Enable Cross-Origin Requests
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Body parser
app.use(bodyParser.json());

//File upload
app.use(fileUpload());

//Express routes
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', matchingRoutes);
app.use('/api', reisRoutes);
app.use('/api', testingRoutes);
app.use('/api', requestRoutes);
app.use('/api', emailRoutes);

//Start server
const server = app.listen(port, function(){
    console.log("Listening to port " + port);
});

//SocketIO
const io = socket(server);

io.on('connection', function(socket){
    console.log("user connected: "+socket.id);
    socket.on('createRoom', function(data) {
      console.log(socket.id+" joined room: "+ data.roomid);
      socket.join(data.roomid);
    });

    socket.on('disconnect', function() {
      console.log("user: "+socket.id+" left");
      socket.emit('set_socket_status');
    });

    socket.on('force_disconnect', function(){
      socket.disconnect();
    });

    socket.on('chat_already_loaded', function(data){
      socket.leave(data.room_id);
    });

    socket.on('chat', function(data){
      let message = {
        message: data.message,
        time: data.time
      };
      socket.to(data.room_id).emit('chat',message);
    });
});

module.exports = app;
