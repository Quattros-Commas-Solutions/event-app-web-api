var Mongoose = require('mongoose');

var responseTypeSchema = Mongoose.Schema({
    value: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

var ResponseType = module.exports = Mongoose.model('responseType', responseTypeSchema, 'responseTypes');