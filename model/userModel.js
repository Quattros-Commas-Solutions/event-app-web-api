const Mongoose = require('mongoose');

const userSchema = Mongoose.Schema({
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
        immutable: true,
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
        required: true,
        enum: [0, 1, 2]
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
    },
    notifications: {
        type: [new Mongoose.Schema({
            notificationID: {
                type: Mongoose.Types.ObjectId,
                ref: 'notifications',
                required: [true, 'You must provide a notification ID']
            },
            read: {
                type: Boolean,
                default: false,
            }
        })],
        default: []
    }
});

const User = module.exports = Mongoose.model('user', userSchema, 'users');