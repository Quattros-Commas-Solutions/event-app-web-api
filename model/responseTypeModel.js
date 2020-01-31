const Mongoose = require('mongoose');

const responseTypeSchema = Mongoose.Schema({
    value: {
        type: Number,
        required: [true, 'Response type value must be specified']
    },
    name: {
        type: String,
        required: [true, 'Response type name must be specified'],
        minlength: [1, 'Response type name must be at least 1 character long'],
        maxlength: [255, 'Response type name cannot be longer than 255 characters']
    }
});

const ResponseType = module.exports = Mongoose.model('responseType', responseTypeSchema, 'responseTypes');