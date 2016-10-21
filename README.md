# raspicamapp
An application to control the Raspberry Pi Camera

```
npm install
```

# Roadmap

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
5. Timelapse with raspistill or cronjob to take single shots? can run longer?
6. Allow to use different/several cameras through a camera config.
