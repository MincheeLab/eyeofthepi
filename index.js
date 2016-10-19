var fs = require('fs');
var path = require('path');

var moment = require('moment');
var jsonfile = require('json-file-plus');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer();

var io = require('socket.io')(http);

var spawn = require('child_process').spawn;
var proc;

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
  // read timelapses folder
  var folders = fs.readdir(__dirname + '/timelapses', function(err, files) {
    if (err) {
      return res.status(404).send({ message: 'Cannot read timelapse folder', error: '404'});
    }
    return res.send(files);
  });
});

/*
  create a new timelapse
*/
app.post('/timelapses', function(req, res) {
  // create a new folder
  var id = moment().format("YYYYMMDD-hhmmss");
  var tldir = __dirname + "/timelapses/" + id;
  fs.mkdirSync(tldir);

  // create config.json file
  var filename = path.join(tldir, 'config.json');
  fs.appendFileSync(filename, '{}');
  
  // create config file
  jsonfile(filename, function(err, file) {
    if (err) {
      return res.status(404).send({ message: 'Cannot find the file ' + filename, error: '404'});
    }
    file.set({
      id: id,
      metadata: {
        name: req.body.name ? req.body.name : id
      },
      timelapse: req.body.timelapse,
      timeout: req.body.timeout
    });
    file.save().then(function() {
      return res.send(file.data);
    }).catch(function(err) {
      return res.status(500).send({ message: 'Cannot save the config file', error: '500'});
    })
  });
});

/*
  get a timelapse detail info
*/
app.get('/timelapses/:id', function(req, res) {
  var id = req.params.id;
  var filename = path.join(__dirname, 'timelapses', id, id + '.json');

  jsonfile(filename, function(err, file) {
    if (err) {
      return res.status(404).send({message: 'Cannot find the config file ' + filename, error: '404'});
    }
    file.get().then(function(d) {
      return res.send(d);
    }).catch(function(err){
      return res.status(500).send({message: "Cannot read the config file", error: '500'});
    });
  });
});

/*
  delete a timelapse
*/
app.delete('/timelapses/:id', function(req, res) {

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
