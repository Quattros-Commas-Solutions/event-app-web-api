const Mongoose = require('mongoose');

const LocationSchema = require('./schema/locationSchema');

const companySchema = Mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name must be specified'],
        trim: true,
        minlength: [1, 'Company name must be at least 1 character long'],
        maxlength: [255, 'Company name cannot be longer than 255 characters']
    },
    location: {
        type: LocationSchema,
        required: [true, 'Company location must be specified']
    },
    logoURL: {
        type: String,
        trim: true,
        default: ''
    }
});

const Company = module.exports = Mongoose.model('company', companySchema, 'companies');