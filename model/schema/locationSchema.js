const Mongoose = require('mongoose');

const locationSchema = Mongoose.Schema({
    address: {
        type: String,
        trim: true,
        required: [true, 'Location address must be specified']
    },
    latitude: {
        type: Number,
        required: [true, 'Location latitude must be specified'],
        min: 0,
        max: 360
    },
    longitude: {
        type: Number,
        required: [true, 'Location longitude must be specified'],
        min: 0,
        max: 360
    }
});

module.exports = locationSchema;