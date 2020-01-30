const Mongoose = require('mongoose');
const Validator = require('validator');

const LocationSchema = require('../util/schemas/locationSchema');

//validator function for checking if dates are in the future when creating an event
const dateInFutureAndValid = (value) => {
    if(!Validator.isISO8601(value + '')) return false;
    return value > Date.now();
}

const eventSchema = Mongoose.Schema({
    companyID: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: [true, 'Event name must me specified'],
        minlength: [1, 'Event name must be at least 1 character long']
    },
    location: {
        type: LocationSchema,
        required: [true, 'Event location must me specified'],
    },
    startTime: {
        type: Date,
        required: true,
        validate: {
            validator: dateInFutureAndValid,
            message: 'Event start time has to be in the future and a valid date'
        }
    },
    endTime: {
        type: Date,
        required: true,
        validate: {
            validator: dateInFutureAndValid,
            message: 'Event end time has to be in the future and a valid date'
        }
    },
    description: {
        type: String,
        maxlength: [1000, 'Event description maximum length is 1000 characters']
    },
    posterURL: String,
    documentURL: Array,
    attendanceRequired: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    }
});

//validating one parameter based on the other one
//pre function attaches a callback to a specified middleware function, in this case 'validate'
eventSchema.pre('validate', function(next){
    if (this.startTime >= this.endTime) {
        this.invalidate('startTime', 'Event start time must be before end time.', this.startTime);
    }   

    next();
});

const Event = module.exports = Mongoose.model('event', eventSchema, 'events');