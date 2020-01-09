var Mongoose = require('mongoose');

var userSchema = Mongoose.Schema({
    companyID: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    name: { 
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    gender: String,
    dateOfBirth: Date,
    passwordHash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    accessType: {
        type: Number,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
});

var User = module.exports = Mongoose.model('user', userSchema, 'users');