const Mongoose = require('mongoose');

const companySchema = Mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: Object,
        required: true
    },
    logoURL: String
});

const Company = module.exports = Mongoose.model('company', companySchema, 'companies');