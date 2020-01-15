const Mongoose = require('mongoose');

const companySchema = Mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'Company name cannot be left empty']
    },
    location: {
        type: new Mongoose.Schema({
            address: {
                type: String,
                trim: true,
                required: true,
            },
            latitude: {
                type: Number,
                required: true,
                min: 0,
                max: 360
            },
            longitude: {
                type: Number,
                required: true,
                min: 0,
                max: 360
            }
        }),
        required: [true, 'Company location is required']
    },
    logoURL: {
        type: String,
        trim: true
    }
});

const Company = module.exports = Mongoose.model('company', companySchema, 'companies');