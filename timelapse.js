var fs = require("fs");
var moment = require("moment");
var avconv = require("avconv");
var Camera = require("raspicam");

// Setup
// console.log(`This platform is ${process.platform}`);
// TODO:
try {
  fs.accessSync(__dirname + "/shots");
} catch (e) {
  fs.mkdirSync(__dirname + "/shots");
}
var dir = moment().format("YYYYMMDD-hhmmss");
var path = __dirname + "/shots/" + dir;

// Camera timelapse
var opts = {
        mode: "timelapse", //photo, timelapse, video
        output: path + "/pic-%04d.jpg",
        timelapse: 10000,
        timeout: 2000000,
        width: 2592,
        height: 1944,
        quality: 80
};
var camera = new Camera(opts, {silent: true});
camera.start( );


//listen for the "started" event triggered when the start method has been successfully initiated
camera.on("start", function(){
	console.log("starting timelapse at " + moment().format('MMMM Do YYYY, h:mm:ss a'));
});

//listen for the "read" event triggered when each new photo/video is saved
camera.on("read", function(err, filename){
	console.log("one more photo!");
});

//listen for the process to exit when the timeout has been reached
camera.on("exit", function(){
  // TODO: shout to application
	console.log("stopping timelapse, starting avconv....");
  camera.stop();

  var params = [
    '-framerate', '25',
    '-f', 'image2',
    '-i', path + "/pic-%04d.jpg",
    // '-c:v','libvpx', // libvpx|h264
    // '-deadline', 'realtime',
    '-y', path + "/" + dir + ".mkv"
  ];
  var stream = avconv(params);

  // TODO: shout video conversion progress
  stream.on('progress', function(progress) {
    console.log(progress);
  });
  stream.on('message', function(data) {
    process.stdout.write(data);
  });
    stream.on('error', function(data) {
      process.stderr.write(data);
  });

  stream.once('exit', function(exitCode, signal, metadata) {
    console.log('here I am officially DONE!!!');
  });

});
