var fs = require('fs');
var path = require('path');

var moment = require('moment');
var jsonfile = require('json-file-plus');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var io = require('socket.io')(http);
var spawn = require('child_process').spawn;
var proc;
var find = require('find');

var Timelapse = require('./timelapse');

// webapp
app.use('/', express.static(path.join(__dirname, 'stream')));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// initial page, including preview
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

/*
  list of timelapses from timelapses/ folder
  each folder include: photos, animated gif thumbnail, config.json and video
*/
app.get('/timelapses', function(req, res) {
  var configFiles = [];
  // read timelapses folder and load all config.json
  find.file(/\.json$/, path.join(__dirname, 'timelapses'), function(files){
    if (!files.length) {
      return res.send(configFiles);
    }
    files.forEach(function(file, idx) {
      configFiles.push(JSON.parse(fs.readFileSync(file, {encoding: 'utf8'})));
      if (idx >= files.length - 1) {
        return res.send(configFiles);
      }
    }, this);
  }).error(function(err) {
    return res.status(500).send({message: 'Cannot read the timelapses folder', error: 500});
  });
});

/*
  create a new timelapse
  TODO: 
    - cronjob scheduling
    - websockets to inform every photo and the video (if required)
*/
app.post('/timelapses', function(req, res) {
  var tl = new Timelapse(req.body, function(err, t) {
    tl.start(function(err, v){
      if (err) {
        return res.status(500).send({ message: 'Problem with the timelapse', error: '500'});
      }
      // transform photos into a video
      if (req.body.transform) {
        tl.transform(function(err){

        });
      }
      console.log('========= timelapse completed ============');
    })
    return res.send(t);
  });
});

/*
  get a timelapse detail info
*/
app.get('/timelapses/:id', function(req, res) {
  var id = req.params.id;
  var tl = new Timelapse(id, function(err, t) {
    return res.send(t);
  });
});

/*
  delete a timelapse
*/
app.delete('/timelapses/:id', function(req, res) {
  var t = new Timelapse();
  t.load(req.params.id, function(err){
    t.remove(function(err){
      if (!err) {
        return res.status(200).send({message: 'Timelapse deleted.'});
      }
    })
  })
});

/*
  modify an existing timelapse (before it starts)
*/
app.put('/timelapses/:id', function(req, res) {

});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

// websockets
var sockets = {};

io.on('connection', function(socket) {

  sockets[socket.id] = socket;
  console.log("Total clients connected : ", Object.keys(sockets).length);

  socket.on('disconnect', function() {
    delete sockets[socket.id];

    // no more sockets, kill the stream
    if (Object.keys(sockets).length == 0) {
      app.set('watchingFile', false);
      if (proc) proc.kill();
      fs.unwatchFile('./stream/image_stream.jpg');
    }
  });

  socket.on('start-stream', function() {
    startStreaming(io);
  });

});

function stopStreaming() {
  if (Object.keys(sockets).length == 0) {
    app.set('watchingFile', false);
    if (proc) proc.kill();
    fs.unwatchFile('./stream/image_stream.jpg');
  }
}

function startStreaming(io) {

  if (app.get('watchingFile')) {
    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    return;
  }

  var args = ["-w", "640", "-h", "480", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "100"];
  proc = spawn('raspistill', args);

  console.log('Watching for changes...');

  app.set('watchingFile', true);

  fs.watchFile('./stream/image_stream.jpg', function(current, previous) {
    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
  })

}
