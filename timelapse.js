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

// Camera timelapse
var opts = {
        mode: "timelapse", //photo, timelapse, video
        output: __dirname + "/shots/" + dir + "/%04d.jpg",
        timelapse: 60000,
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
	console.log("stopping timelapse....");
  // camera.stop();
});
