var Mongoose = require('mongoose');

var userTypeSchema = Mongoose.Schema({
    value: {
        type: Number,
         required: true
    },
    name: {
        type: String,
        required: true
    }
});

var UserType = module.exports = Mongoose.model('userType', userTypeSchema);