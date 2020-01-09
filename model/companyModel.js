var Mongoose = require('mongoose');

var companySchema = Mongoose.Schema({
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

var Company = module.exports = Mongoose.model('company', companySchema);