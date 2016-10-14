var fs = require("fs");
var moment = require("moment");
var RaspiCam = require("raspicam");

// Setup
// console.log(`This platform is ${process.platform}`);
// TODO: for a timelapse created a unique folder (date based)
try {
  fs.accessSync(__dirname + "/shots");
} catch (e) {
  fs.mkdirSync(__dirname + "/shots");
}

// Camera timelapse
var dir = moment().format("YYYYMMDD-HHMMSS");
var opts = {
        mode: "timelapse", //photo, timelapse, video
        output: "/home/pi/shots/shots_%03d.jpg",
        timelapse: 20000,
        width: 2592,
        height: 1944
        // framerate: 15,
};
var camera = new RaspiCam(opts);
camera.start( );

//to stop a timelapse or video recoqrding
// camera.stop( );

//listen for the "started" event triggered when the start method has been successfully initiated
camera.on("start", function(){
	console.log("starting timelapse at " + moment().format('MMMM Do YYYY, h:mm:ss a'));
});

//listen for the "read" event triggered when each new photo/video is saved
camera.on("read", function(err, filename){
	// console.log("one more photo!");
});

//listen for the process to exit when the timeout has been reached
camera.on("exit", function(){
	// console.log("stopping timelapse....");
});
