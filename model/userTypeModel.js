const Mongoose = require('mongoose');

const userTypeSchema = Mongoose.Schema({
    value: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

const UserType = module.exports = Mongoose.model('userType', userTypeSchema, 'userTypes');