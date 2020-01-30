const Mongoose = require('mongoose');

const userTypeSchema = Mongoose.Schema({
    value: {
        type: Number,
        required: [true, 'User type value must be specified']
    },
    name: {
        type: String,
        required: [true, 'User type name must be specified'],
        enum: [['Super-Admin', 'Admin', 'Employee'], 'User type value is not valid']
    }
});

const UserType = module.exports = Mongoose.model('userType', userTypeSchema, 'userTypes');