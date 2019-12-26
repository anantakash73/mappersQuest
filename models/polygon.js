const mongoose = require('mongoose')

const polygonSchema = new mongoose.Schema({
    properties: mongoose.Mixed,
    type: {
        type: String,
        enum: ['Polygon'],
        required: true
    },
    coordinates: {
        type: [
            [
                [Number]
            ]
        ], // Array of arrays of arrays of numbers
        required: true
    }
});
polygonSchema.index({ polygon: '2dsphere' })

module.exports.polygon = mongoose.model('Polygon', polygonSchema, 'polygons')