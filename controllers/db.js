const mongoose = require('mongoose')
var modelPolygon = require("../models/polygon")
var modelMultiPolygon = require("../models/multipolygon")
var turf = require('@turf/turf')

function checkDB() {

    var db = mongoose.connection
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        // we're connected!
        console.log("connected to database")
    });
}

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

function parseGeoJson(geoJson) {
    // let geoJsonFeature = {
    //     "type": "FeatureCollection",
    //     "features": [{
    //             "type": "Feature",
    //             "properties": {},
    //             "geometry": {
    //                 "type": "Polygon",
    //                 "coordinates": [
    //                     [
    //                         [-0.14007568359375, 51.5027589576403],
    //                         [-0.12325286865234374, 51.5027589576403],
    //                         [-0.12325286865234374, 51.512588580360244],
    //                         [-0.14007568359375, 51.512588580360244],
    //                         [-0.14007568359375, 51.5027589576403]
    //                     ]
    //                 ]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {},
    //             "geometry": {
    //                 "type": "Polygon",
    //                 "coordinates": [
    //                     [
    //                         [-0.1352691650390625, 51.50810140697543],
    //                         [-0.11398315429687499, 51.50810140697543],
    //                         [-0.11398315429687499, 51.51963895991333],
    //                         [-0.1352691650390625, 51.51963895991333],
    //                         [-0.1352691650390625, 51.50810140697543]
    //                     ]
    //                 ]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "hello": "dello"
    //             },
    //             "geometry": {
    //                 "type": "Polygon",
    //                 "coordinates": [
    //                     [
    //                         [-0.13595581054687497, 51.49698840879303],
    //                         [-0.11226654052734375, 51.49698840879303],
    //                         [-0.11226654052734375, 51.50510971251776],
    //                         [-0.13595581054687497, 51.50510971251776],
    //                         [-0.13595581054687497, 51.49698840879303]
    //                     ]
    //                 ]
    //             }
    //         }
    //     ]
    // }

    turf.geomEach(geoJson, (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) => {
        // if (currentGeometry.type === "Polygon") {
        //     saveObjectToDb({
        //         properties: featureProperties,
        //         coordinates: currentGeometry.coordinates
        //     })

        // } else if (currentGeometry.type === "MultiPolygon") {
        //     console.log("Error here, non polygon added")
        //     saveObjectToDb({
        //         properties: featureProperties,
        //         coordinates: currentGeometry.coordinates
        //     })
        // }
        saveObjectToDb({
            properties: featureProperties,
            coordinates: currentGeometry.coordinates
        }, currentGeometry.type)

    })

}

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