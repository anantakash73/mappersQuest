var express = require('express');
var router = express.Router();
var controller = require('../controllers/db')
var gjv = require('geojson-validation')
var random = require('geojson-random');
var request = require('request')

/* GET home page. */
router.get('/checkDB', function(req, res, next) {
    console.log("reached get request")
    controller.databaseCheck()
});

router.post('/savePolygon', (req, res, next) => {
    if (gjv.valid(req.body)) {
        controller.saveToDatabase(req.body).then((saveStatus) => {
            console.log(saveStatus)
            if (saveStatus) res.status(200).send({ "message": "polygon saved" })
            else res.status(500).send({ "message": "unable to save" })
        })
    } else {
        res.status(400).send({ "message": "invalid geojson object" })

    }
})

router.get('/showPolygons', (req, res, next) => {
    controller.getFromDatabase().then((features) => {
        // })
        //console.log(features)
        let formatted_features = []
        features.forEach((feature) => {
            geojson_feature = {
                "type": "Feature",
                "id": feature._id,
                "properties": feature.properties !== undefined ? feature.properties : "{}",
                "geometry": {
                    "type": feature.type,
                    "coordinates": feature.coordinates
                }
            }

            if (gjv.valid(geojson_feature)) formatted_features.push(geojson_feature)
            else console.log("INVALID GEOJSON")

        })
        res.json({
            polygons: formatted_features
        })
    })
})

router.get('/getJSON', (req, response, next) => {
    let url = req.query.url
    request(url, (err, res, body) => {
        if (!err && gjv.valid(JSON.parse(body)))
            response.status(200).json(body)
        else
            response.status(400).send({ "message": "invalid json" })
    })

})

router.post('/getRandomPolygon', (req, res, next) => {
    let mapBbox = req.body
    let minX = mapBbox['_southWest']['lat']
    let minY = mapBbox['_southWest']['lng']
    let maxX = mapBbox['_northEast']['lat']
    let maxY = mapBbox['_northEast']['lng']
    console.log(minX, minY, maxX, maxY)

    res.json({ "polygons": [random.polygon(1, 5, 0.01, [minY, minX, maxY, maxX]).features[0]] })
})
module.exports = router;