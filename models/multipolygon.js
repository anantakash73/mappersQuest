const mongoose = require('mongoose')

const multiPolygonSchema = new mongoose.Schema({
    properties: mongoose.Mixed,
    type: {
        type: String,
        enum: ['MultiPolygon'],
        required: true
    },
    coordinates: {
        type: [
            [
                [
                    [Number]
                ]
            ]
        ], // Array of arrays of arrays of numbers
        required: true
    }
}, );
multiPolygonSchema.index({ multiPolygon: "2dsphere" })
module.exports.multiPolygon = mongoose.model('MultiPolygon', multiPolygonSchema, 'multipolygons')