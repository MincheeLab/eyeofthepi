var fs = require("fs");
var path = require('path');
var jsonfile = require('json-file-plus');
var moment = require("moment");
var _ = require("lodash");
var avconv = require("avconv");
var Camera = require("raspicam");

/*
  TODO 
  methods: run, video, update, remove
  path to timelapse folder to fix
  timelapse default settings (editable in UI => json file)
  update json file when timelapse is completed
  send websockets update on timelapse and video conversion
*/

var timelapseSchema = {
  id: null,
  metadata: {
    name: '', //default to id
    nbPhotos: 0,
    video: '' 
  },
  opts: { //raspistill params
    mode: "timelapse",
    output: "pic-%04d.jpg",
    timelapse: 10000,
    timeout: 2000000,
    width: 2592,
    height: 1944,
    quality: 80,
    nopreview: true
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
  var self = this;
  this.settings = {};
  _.merge(this.settings, timelapseSchema, data);

  // create a new id / folder
  var id = moment().format("YYYYMMDD-hhmmss");
  var tldir = path.join(__dirname, "../timelapses", id);
  fs.mkdirSync(tldir);
  this.settings.id = id;

  // create config.json file
  var filename = path.join(tldir, 'config.json');
  fs.appendFileSync(filename, '{}');
  
  this.saveSettings(function(err, rs) {
    if (err) {
      return callback(err);
    }
    return callback(null, self.settings);
  })
}

Timelapse.prototype.load = function(id, callback) {
  var self = this;
  var filename = path.join(__dirname, '../timelapses', id, 'config.json');
  jsonfile(filename, function(err, file) {
    if (err) {
      return callback(err);
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

Timelapse.prototype.saveSettings = function(callback) {
  var self = this;
  var filename = path.join(__dirname, '../timelapses', this.settings.id, 'config.json');
  // create config file
  jsonfile(filename, function(err, file) {
    if (err) {
      return callback(err);
    }
    file.set(self.settings);
    file.save().then(function() {
      return callback(null, self.settings);
    }).catch(function(err) {
      return callback(err); 
    })
  });
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
  var self = this;
  var dir = path.join(__dirname, "../timelapses", this.settings.id);
  var opts = {
        mode: "timelapse",
        output: dir + "/pic-%04d.jpg",
        timelapse: 10000,
        timeout: 2000000,
        width: 2592,
        height: 1944,
        quality: 80,
        nopreview: true
        // "verbose": true
  };
  _.merge(opts, this.settings.opts);
  this.camera = new Camera(opts);
  this.camera.start();

  camera.on("start", function(err, timestamp){
    if (err) {
      return console.log(err);
    }
    self.settings.metadata.start_time = timestamp;
	  console.log("starting timelapse at " + moment().format('MMMM Do YYYY, h:mm:ss a'));
  });

  camera.on("read", function(err, timestamp , filename){
    self.settings.metadata.nbPhotos += 1;
	  console.log("Smile!", filename);
  });

  camera.on("exit", function(timestamp){
    self.settings.metadata.end_time = timestamp;
    // store all metadata
    self.saveSettings();
    return callback(null);
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