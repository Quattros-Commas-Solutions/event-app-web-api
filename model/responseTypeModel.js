const Mongoose = require('mongoose');

const responseTypeSchema = Mongoose.Schema({
    value: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

const ResponseType = module.exports = Mongoose.model('responseType', responseTypeSchema, 'responseTypes');