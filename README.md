# Eye Of The Pi (EOTP)

The idea behind this project is to allow anyone to simply use the raspberry pi camera through a mobile interface and be able to 
use it for timelapse, video or simply take a photo. We started with the timelapse feature since it seems the most interesting
to us for this project but hopefully this application would become a complete UI to easily use your Pi as a remote camera.

Our objectives are:
* A simple way to setup a RPi as a EOTP application (no command line for those who do not want)
* An intuitive UI to control the RPi Camera including image/video preview, timelapse scheduling, video recording...
* A simple way to connect to your RPi: the Pi act as a hotspot, just connect your device on it and open your browser!
* There is no database, everything is file-based to keep it simple and light and because you usually don't need a database for such 
a simple application.

Currently we are only implementing the default Rasperry Pi Camera but we could consider extend it in the future.

# Installation
The easiest way to use it is to download the pre-made sdcard image. 
This image was created with [PiBakery](https://github.com/davidferguson/pibakery), it is based on a Raspbian Lite on which
we add some applications ([NodeJS](https://nodejs.org/), [git](https://git-scm.com/), [libav](https://libav.org/)...) and the EOTP node application.
The first boot will take some time to download and install of of these required application, but later, each reboot of your Pi 
will automatically upload the EOTP from this github repo.

You can also install it manually (useful for dev on your own computer) with a simple:
```
npm install
```

For fun (and to give some credits to PiBakery project), here is a screenshot of our PiBakery setup (see how easy it is?).
[PiBakery with EOTP]()

# API 
currently only the REST API is available (no UI). 

## Timelapses
### GET /timelapses
Return an array with the list of all timelapses available on the Pi (photos previously taken),
with their detail information (based on the Raspberry Pi tool [raspistill API](https://www.raspberrypi.org/documentation/raspbian/applications/camera.md).

```
[
  {
    id: 'YearMonthDay-HourMinSec', // date of creation of the timelapse
      metadata: {
        name: '', //default to id
        nbPhotos: 30, //added at the end of the timelapse
        video: '', //video file if generated
        gif: '', // animated gif if generated
        start_time: 1223232 //timestamp
        end_time: 123456789 //timestamp
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
]
```

### POST /timelapses
Allow us to create a new timelapse with a JSON payload (based on the timelapse schema) to give any specific details we need.
Return a JSON object with the complete configuration of the timelapse and start the timelapse right away in the background (scheduler coming later probably).

```
{
  "metadata": {
    "name": "test API"
  },
  "opts": {
  	"quality": "60",
  	"width": "640",
  	"height": "480"
  }
}
```

### GET /timelapses/:id
Return a JSON object with the detail of an existing timelapse. Convenient to view all photos, download or generate video or animated gif.
Once scheduling is implemented then it could also be useful to edit an upcoming timelapse.

### DELETE /timelapses/:id
TBD...

### PATCH /timelapses/:id
TBD...


# UI Application
The frontend UI is not yet done but the plan is to use Angular2 and possibly Angular Material to make a very intuitive web application
that works nicely on mobile phone.

# Roadmap

v0.0.2: Backend API for Timelapse (current version).
Currently we only have NodeJS backend API for timelapse but we have big plans!

v0.1.0: Timelapse App
Backend: NodeJS/Express | Frontend: Angular2
1. API + UI: Create a new timelapse
2. API + UI: List all timelapses
3. API + UI: Show details of a timelapse (all photos and settings)
4. API + UI: preview camera (stream)

v0.2.0: Timelapse advanced settings
1. Generate video from timelapse photos
1. allow configuration of camera (fx, brightness,...)
2. allow cronjob of timelapse
3. Avconv settings: framerate, photos selection...

v0.3.0: Preview
1. Preview photo/video (webRTC, websocket?)

v0.5.0: Photo/video
1. Take photo
2. Take video

v0.6.0: Tests

v0.7.0: hotspot


Future plan/Questions (no particular order):
1. auto upload to cloud services
2. plugins
3. animated gif (ImageMagick?): convert -delay 10 -loop 0 image*.jpg animation.gif
4. Add an OLED screen for useful information display (IP, status,...)
5. Timelapse with raspistill or cronjob to take single shots? 
6. Allow to use different/several cameras through a camera config.
