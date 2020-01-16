const Mongoose = require('mongoose');

const locationSchema = Mongoose.Schema({
    address: {
        type: String,
        trim: true,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
        min: 0,
        max: 360
    },
    longitude: {
        type: Number,
        required: true,
        min: 0,
        max: 360
    }
});

module.exports = locationSchema;