var http = require("http");
var express = require("express");
var app = express();
app.set('trust proxy', true); // <- required
app.use((req, res, next) => {
  if(!req.secure) return res.redirect('https://' + req.get('host') + req.url);
  next();
});

var server = http.createServer(app);
var port = process.env.PORT || 3000;

server.listen(port);
app.use(express.static("public"));

var io = require("socket.io")(server, {
  pingInterval: 1000,
  pingTimeout: 3000
});

//express configuration
app.use(express.static('public'));

//socket.io events
io.on('connection', function(socket) {

  //entry log.
  console.log('someone connected.');

  //on 'sound'
  // var soundactive = false;
  socket.on('sound', function(sound) {

    //relay the message to everybody EXCEPT the sender
    socket.broadcast.emit('sound', sound);

    //DEBUG
    console.log('sound.name :' + sound.name);
    console.log('sound.action :' + sound.action);
    console.log('sound.group :' + sound.group);
  });

  //on 'pan'
  socket.on('pan', function(pan) {

    //relay the message to everybody EXCEPT the sender
    socket.broadcast.emit('pan', pan);

    //DEBUG
    console.log('pan.width :' + pan.width);
    console.log('pan.speed :' + pan.speed);
  });

  //on 'clap' --> relay the message to everybody INCLUDING sender
  socket.on('clap', function(clap) {

    //relay the message to everybody INCLUDING sender
    io.emit('clap', clap);

    //DEBUG
    console.log('clap.name :' + clap.name);
  });

  //on 'disconnect'
  socket.on('disconnect', function() {

    console.log('someone disconnected.');

  });
});
