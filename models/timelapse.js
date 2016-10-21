var fs = require("fs");
var path = require('path');
var jsonfile = require('json-file-plus');
var moment = require("moment");
var avconv = require("avconv");
var Camera = require("raspicam");

/*
  TODO methods: run, video, update, remove
  
*/

var timelapseSchema = {
  id: null,
  metadata: {
    name: '', //default to id
    nbPhoto: 0,
    video: '' 
  },
  opts: { //raspistill params
    mode: "timelapse",
    output: "pic-%04d.jpg",
    timelapse: 10000,
    timeout: 2000000,
    width: 2592,
    height: 1944,
    quality: 80
  }
};

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
  this.settings = Object.assign({}, timelapseSchema, data);
  // create a new folder
  var id = moment().format("YYYYMMDD-hhmmss");
  var tldir = path.join(__dirname, "../timelapses", id);
  fs.mkdirSync(tldir);
  this.settings.id = id;

  // create config.json file
  var filename = path.join(tldir, 'config.json');
  fs.appendFileSync(filename, '{}');
  
  // create config file
  var self = this;
  jsonfile(filename, function(err, file) {
    if (err) {
      return callback(err);
    }
    file.set(self.settings);
    file.save().then(function() {
      self.settings = file.data;
      return callback(null, file.data);
    }).catch(function(err) {
      return callback(err); 
    })
  });
}

Timelapse.prototype.load = function(id, callback) {
  var self = this;
  var filename = path.join(__dirname, '../timelapses', id, 'config.json');
  
  jsonfile(filename, function(err, file) {
    if (err) {
      callback(err);
    }
    file.get().then(function(d) {
      self.settings = d;
      return callback(null, self.settings);
    }).catch(function(err){
      return callback(err);
    });
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

Timelapse.prototype.start = function(callback) {
  console.log(`This platform is ${process.platform}`);
  this.settings.opts = {
        mode: "timelapse", //photo, timelapse, video
        output: path + "/pic-%04d.jpg",
        timelapse: 10000,
        timeout: 2000000,
        width: 2592,
        height: 1944,
        quality: 80
  };
  
  this.camera = new Camera(this.settings.opts, {silent: true});
  this.camera.start();

  camera.on("start", function(){
	  console.log("starting timelapse at " + moment().format('MMMM Do YYYY, h:mm:ss a'));
  });

  camera.on("read", function(err, filename){
	  console.log("one more photo!");
  });

  camera.on("exit", function(){
    console.log("stopping timelapse, starting avconv....");
    return callback(null);
    // this.camera.stop();
  })
}

Timelapse.prototype.transform = function(callback) {
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
}

module.exports = Timelapse;