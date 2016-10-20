var fs = require("fs");
var path = require('path');
var jsonfile = require('json-file-plus');
var moment = require("moment");
var avconv = require("avconv");
var Camera = require("raspicam");

/*
  TODO methods: run, video, update, remove, schema
  
*/

/* 
var timelapseSchema = {
  id: foldername,
  metadata: {
    name: 'name of timelapse | default to id',
    nbPhoto: 183,
    video: 'default id.mkv'
  },
  opts: { //raspistill params
    mode: "timelapse",
    output: path + "/pic-%04d.jpg",
    timelapse: 10000,
    timeout: 2000000,
    width: 2592,
    height: 1944,
    quality: 80
  }
};
*/

var Timelapse = function (data, callback) {
  // id => load existing timelapse
  if (typeof(data) === 'string') {
    this.load(data, callback);
  }
  // object => new timelapse to create 
  if (typeof(data) === 'object') { 
    this.create(data, callback);
  }
}
  
Timelapse.prototype.data = {}

Timelapse.prototype.create = function(data, callback) {
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
      return;
    }
    file.set({
      id: id,
      metadata: {
        name: data.name ? data.name : id
      },
      timelapse: data.timelapse,
      timeout: data.timeout
    });
    file.save().then(function() {
      return callback(null, file.data);
      // res.send(file.data);
    }).catch(function(err) {
      return; //res.status(500).send({ message: 'Cannot save the config file', error: '500'});
    })
  });
}

Timelapse.prototype.load = function(id, callback) {
  var self = this;
  var filename = path.join(__dirname, 'timelapses', id, id + '.json');

  jsonfile(filename, function(err, file) {
    if (!err) {
      file.get().then(function(d) {
        self.data = d;
        return callback(null, self.data);
      }).catch(function(err){
        console.log('500', err);
        return;
      });
    }
  });
}

Timelapse.prototype.get = function (name) {  
    return this.data[name];
}

Timelapse.prototype.set = function (name, value) {  
    this.data[name] = value;
}

Timelapse.findById = function (id, callback) {  
    // db.get('Timelapses', {id: id}).run(function (err, data) {
    //     if (err) return callback(err);
    //     callback(null, new Timelapse(data));
    // });
}

Timelapse.prototype.update = function (data, callback) {  
    // var self = this;
    // db.get('users', {id: this.data.id}).update(JSON.stringify(this.data)).run(function (err, result) {
    //     if (err) return callback(err);
    //     callback(null, self); 
    // });
}

Timelapse.prototype.remove = function(callback) {
  console.log('removing the timelapse..', this.id);
}

Timelapse.prototype.run = function(id, callback) {

}

module.exports = Timelapse;

// Setup
// console.log(`This platform is ${process.platform}`);
// TODO:
// try {
//   fs.accessSync(__dirname + "/shots");
// } catch (e) {
//   fs.mkdirSync(__dirname + "/shots");
// }
// var dir = moment().format("YYYYMMDD-hhmmss");
// var path = __dirname + "/shots/" + dir;

// // Camera timelapse
// var opts = {
//         mode: "timelapse", //photo, timelapse, video
//         output: path + "/pic-%04d.jpg",
//         timelapse: 10000,
//         timeout: 2000000,
//         width: 2592,
//         height: 1944,
//         quality: 80
// };
// var camera = new Camera(opts, {silent: true});
// camera.start( );


// //listen for the "started" event triggered when the start method has been successfully initiated
// camera.on("start", function(){
// 	console.log("starting timelapse at " + moment().format('MMMM Do YYYY, h:mm:ss a'));
// });

// //listen for the "read" event triggered when each new photo/video is saved
// camera.on("read", function(err, filename){
// 	console.log("one more photo!");
// });

// //listen for the process to exit when the timeout has been reached
// camera.on("exit", function(){
//   // TODO: shout to application
// 	console.log("stopping timelapse, starting avconv....");
//   camera.stop();

//   var params = [
//     '-framerate', '25',
//     '-f', 'image2',
//     '-i', path + "/pic-%04d.jpg",
//     // '-c:v','libvpx', // libvpx|h264
//     // '-deadline', 'realtime',
//     '-y', path + "/" + dir + ".mkv"
//   ];
//   var stream = avconv(params);

//   // TODO: shout video conversion progress
//   stream.on('progress', function(progress) {
//     console.log(progress);
//   });
//   stream.on('message', function(data) {
//     process.stdout.write(data);
//   });
//     stream.on('error', function(data) {
//       process.stderr.write(data);
//   });

//   stream.once('exit', function(exitCode, signal, metadata) {
//     console.log('here I am officially DONE!!!');
//   });

// });
