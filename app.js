var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var find = require('find');
var Timelapse = require('./models/timelapse');

router.get('/', function (req, res, next) {
    res.render('index');
});

fs.mkdir('./timelapses', function(err) {});

/*
  GET /timelapses
  list of timelapses from timelapses/ folder
  each folder include: photos, animated gif thumbnail, config.json and video
*/
router.get('/timelapses', function (req, res, next) {
  var configFiles = [];
  // read timelapses folder and load all config.json
  find.file(/\.json$/, path.join(__dirname, './timelapses'), function(files){
      if (!files.length) {
      return res.send(configFiles);
  }
  files.forEach(function(file, idx) {
    configFiles.push(JSON.parse(fs.readFileSync(file, {encoding: 'utf8'})));
    if (idx >= files.length - 1) {
      return res.send(configFiles);
    }
  }, this);
}).error(function(err) {
  return res.status(500).send({message: 'Cannot read the timelapses folder', error: 500});
});
});

/*
  GET /timelapses/:id
  get a timelapse detail info
*/
router.get('/timelapses/:id', function(req, res, next) {
  var id = req.params.id;
  var tl = new Timelapse(id, function(err, t) {
    return res.send(t);
  });
});

/*
  POST /timelapses
  create a new timelapse
  TODO: 
    - cronjob scheduling
    - websockets to inform every photo and the video (if required)
*/
router.post('/timelapses', function(req, res, next) {
  var tl = new Timelapse(req.body, function(err, t) {
    tl.start(function(err, v){
      if (err) {
        return res.status(500).send({ message: 'Problem with the timelapse', error: '500'});
      }
      // transform photos into a video
      if (req.body.transform) {
        tl.transform(function(err){

        });
      }
      console.log('========= timelapse completed ============');
    })
    return res.send(t);
  });
});

/*
  delete a timelapse
*/
router.delete('/timelapses/:id', function(req, res, next) {
  var t = new Timelapse();
  t.load(req.params.id, function(err){
    t.remove(function(err){
      if (!err) {
        return res.status(200).send({message: 'Timelapse deleted.'});
      }
    })
  })
});

/*
  modify an existing timelapse (before it starts)
*/
router.patch('/timelapses/:id', function(req, res, next) {

});

module.exports = router;
