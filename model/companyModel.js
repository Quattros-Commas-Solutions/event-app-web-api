const Mongoose = require('mongoose');

const companySchema = Mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: Object,
        required: true
    },
    logoURL: {
        type: String,
        trim: true
    }
});

const Company = module.exports = Mongoose.model('company', companySchema, 'companies');