var RaspiCam = require("raspicam");


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

//to stop a timelapse or video recording
// camera.stop( );

//listen for the "started" event triggered when the start method has been successfully initiated
camera.on("start", function(){
	console.log("starting timelapse....");
});

//listen for the "read" event triggered when each new photo/video is saved
camera.on("read", function(err, filename){
	console.log("one more photo!");
});

//listen for the process to exit when the timeout has been reached
camera.on("exit", function(){
	console.log("stopping timelapse....");
});
