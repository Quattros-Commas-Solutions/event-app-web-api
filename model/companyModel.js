const Mongoose = require('mongoose');

const LocationSchema = require('../util/schemas/locationSchema');

const companySchema = Mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name must be specified'],
        trim: true,
        minlength: [1, 'Company name must be at least 1 character long']
    },
    location: {
        type: LocationSchema,
        required: [true, 'Company location must be specified']
    },
    logoURL: {
        type: String,
        trim: true
    }
});

const Company = module.exports = Mongoose.model('company', companySchema, 'companies');