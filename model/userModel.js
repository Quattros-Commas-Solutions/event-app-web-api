const Mongoose = require('mongoose');
const Validator = require('validator');

const userSchema = Mongoose.Schema({
    companyID: {
        type: Mongoose.Types.ObjectId,
        required: [true, 'Company ID must be specified']
    },
    name: {
        type: String,
        required: [true, 'User name must be specified'],
        trim: true
    },
    surname: {
        type: String,
        required: [true, 'User surname must be specified'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'User email must be specified'],
        validate: {
            validator: Validator.isEmail,
            message: 'User email is not valid'
        }
    },
    gender: String,
    dateOfBirth: {
        type: Date,
        validate: {
            validator: Validator.isISO8601,
            message: 'User date of birth format is not valid'
        }
    },
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
        required: [true, 'User access type must be specified'],
        enum: [[0, 1, 2], 'User access type value is not valid']
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    profilePic: {
        type: String,
        default: '',
        trim: true
    }
});

const User = module.exports = Mongoose.model('user', userSchema, 'users');