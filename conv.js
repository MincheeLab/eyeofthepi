var fs = require("fs");
var path = require("path");
var avconv = require("avconv");

var dir = "/Users/gestadieu/Documents/Devs/MincheeFactory/raspicamapp/shots/20161014-112346";
var dir = __dirname + "/shots/";
  // avconv -r 10 -qscale 2 -i /home/pi/shots/photo-%03d.jpg video.mp4
  // avconv -framerate 25 -f image2 -i image-%03d.jpeg -b 65536k out.mov
  // avconv -framerate 25 -f image2 -i %04d.png -c:v h264 -crf 1 out.mov

  var params = [
    '-framerate', '25',
    '-f', 'image2',
    '-i', dir + "photo-%04d.jpg",
    // '-c:v','libvpx', // libvpx|h264
    // '-deadline', 'realtime',
    '-y', path.join(dir, "20161014-112346.mov")
  ];

  // Returns a duplex stream
  var stream = avconv(params);

  // Anytime avconv outputs any information, forward these results to process.stdout
  stream.on('message', function(data) {
    process.stdout.write(data);
  });

  stream.on('progress', function(progress) {
    console.log('here is my progress...' + progress);
      /*
      Progress is a floating number between 0 ... 1 that keeps you
      informed about the current avconv conversion process.
      */
  });

  stream.on('error', function(data) {
    process.stderr.write(data);
});

stream.once('exit', function(exitCode, signal, metadata) {
  console.log('here I am officially DONE!!!');
    /*
    Here you know the avconv process is finished
    Metadata contains parsed avconv output as described in the next section
    */
});
