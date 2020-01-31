const Mongoose = require('mongoose');
const Validator = require('validator');

const isDateValid = (value) => {
    return value < Date.now();
}

const userSchema = Mongoose.Schema({
    companyID: {
        type: Mongoose.Types.ObjectId,
        required: [true, 'Company ID must be specified']
    },
    name: {
        type: String,
        required: [true, 'User name must be specified'],
        trim: true,
        minlength: [1, 'User name must be at least 1 character long'],
        maxlength: [255, 'User name cannot be longer than 255 characters']
    },
    surname: {
        type: String,
        required: [true, 'User surname must be specified'],
        trim: true,
        minlength: [1, 'User surname must be at least 1 character long'],
        maxlength: [255, 'User surname cannot be longer than 255 characters']
    },
    email: {
        type: String,
        required: [true, 'User email must be specified'],
        validate: {
            validator: Validator.isEmail,
            message: 'User email is not valid'
        },
        minlength: [1, 'User email must be at least 1 character long'],
        maxlength: [255, 'User email cannot be longer than 255 characters']
    },
    gender: {
        type: String,
        default: 'Not specified'
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: isDateValid,
            message: 'User date of birth is not valid'
        }
    },
    passwordHash: {
        type: String,
        required: true,
        minlength: ''
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
        default: false
    },
    profilePic: {
        type: String,
        default: '',
        trim: true
    }
});

const User = module.exports = Mongoose.model('user', userSchema, 'users');