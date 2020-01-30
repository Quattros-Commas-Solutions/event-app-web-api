const Mongoose = require('mongoose');

const responseTypeSchema = Mongoose.Schema({
    value: {
        type: Number,
        required: [true, 'Response type value must be specified']
    },
    name: {
        type: String,
        required: [true, 'Response type name must be specified']
    }
});

const ResponseType = module.exports = Mongoose.model('responseType', responseTypeSchema, 'responseTypes');