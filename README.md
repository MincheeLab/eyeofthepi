# raspicamapp
An application to control the Raspberry Pi Camera

```
npm install
```

# Roadmap

v0.1.0: Timelapse App
1. Timelapse + video conversion
2. Webapp to control (start/stop) timelapse: (M)EAN.js
3. List/download all photos/videos
4. preview camera (stream)

v0.2.0: Timelapse settings
1. allow configuration of camera (fx, brightness,...)
2. Avconv settings: framerate, photos selection...

v0.3.0: Preview
1. Preview photo/video (webRTC, websocket?)

v0.5.0: Photo/video
1. Take photo
2. Take video

v0.6.0: Tests

v0.7.0: hotspot


Future plan (no particular order):
1. auto upload to cloud services
2. plugins
3. animated gif (ImageMagick?): convert -delay 10 -loop 0 image*.jpg animation.gif
4. Add an OLED screen for useful information display (IP, status,...)
5. Timelapse with raspistill or cronjob to take single shots? can run longer?
