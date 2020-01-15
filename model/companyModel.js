const Mongoose = require('mongoose');

const companySchema = Mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        minlength: [1, 'Company name cannot be left empty']
    },
    location: {
        type: new Mongoose.Schema({
            address: {
                type: String,
                trim: true,
                required: [true, 'Company location address is required']
            },
            latitude: {
                type: Number,
                required: [true, 'Latitude value for company location is required'],
                validate(value) {
                    if (value > 360 || value < 0) {
                        throw new Error('Invalid latitude value for location');
                    }
                }
            },
            longitude: {
                type: Number,
                required: [true, 'Longitude value for company location is required'],
                validate(value) {
                    if (value > 360 || value < 0) {
                        throw new Error('Invalid latitude value for longitude');
                    }
                }
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