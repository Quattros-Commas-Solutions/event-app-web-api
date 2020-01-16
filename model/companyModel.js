const Mongoose = require('mongoose');

const LocationSchema = require('../util/schemas/locationSchema');

const companySchema = Mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'Company name cannot be left empty']
    },
    location: {
        type: LocationSchema,
        required: [true, 'Company location is required']
    },
    logoURL: {
        type: String,
        trim: true
    }
});

const Company = module.exports = Mongoose.model('company', companySchema, 'companies');