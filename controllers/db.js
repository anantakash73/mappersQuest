const mongoose = require('mongoose')
var modelPolygon = require("../models/polygon")
var modelMultiPolygon = require("../models/multipolygon")
var turf = require('@turf/turf')


// Function to check if the database is connected
function checkDB() {

    var db = mongoose.connection
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        // we're connected!
        console.log("connected to database")
    });
}

// Gets all saved Polygons and MultiPolygons
/* Rationale -> MongoDB can index for geoJSON provided they are indicated to be such.
We create two different collections, Polygon and Multipolygon to hold objects of each type
They are fairly similar except that Multipolygon has a 4 nested array while Polygon has a 3 nested array

*/
async function getPolygonsFromDb() {
    let features = await modelPolygon.polygon.find((err, data) => {
        return data
    })
    let multiFeatures = await modelMultiPolygon.multiPolygon.find((err, data) => {
        return data
    })
    let final_feature_list = []
    features.forEach((feature) => final_feature_list.push(feature))
    multiFeatures.forEach((feature) => final_feature_list.push(feature))

    return final_feature_list
}

// Saves an object to the appropriate collection
function saveObjectToDb(polygonObject, type) {
    if (type === "Polygon") {
        var shape = new modelPolygon.polygon({
            properties: polygonObject.properties,
            type: type,
            coordinates: polygonObject.coordinates
        })
    } else if (type === "MultiPolygon") {
        var shape = new modelMultiPolygon.multiPolygon({
            properties: polygonObject.properties,
            type: type,
            coordinates: polygonObject.coordinates
        })
    }
    shape.save((err, data) => {
        console.log(data, err)
    })

}

// Saves features individually from a list of features of a FeatureCollection
function parseGeoJson(geoJson) {

    turf.geomEach(geoJson, (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) => {

        saveObjectToDb({
            properties: featureProperties,
            coordinates: currentGeometry.coordinates
        }, currentGeometry.type)

    })

}


//The following functions are the ones that are exposed while the ones that interface with the db are kept private
exports.databaseCheck = () => {
    checkDB()
}

exports.saveToDatabase = async function(geoJson) {
    parseGeoJson(geoJson)
    return true
}

exports.getFromDatabase = async function() {
    console.log("in get from database")
    return await getPolygonsFromDb().then((geoJson) => {
        return geoJson
    })
}

module.exports = exports