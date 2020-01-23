const Mongoose = require('mongoose');

const LocationSchema = require('../util/schemas/locationSchema');

//validator function for checking if dates are in the future when creating an event
const dateInFuture = (value) => {
    return value > Date.now();
}

const eventSchema = Mongoose.Schema({
    companyID: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: [1, 'Event name has to be at least 1 character long.']
    },
    location: {
        type: LocationSchema,
        required: true
    },
    startTime: {
        type: Date,
        required: true,
        validate: {
            validator: dateInFuture,
            message: 'Start time has to be in the future.'
        }
    },
    endTime: {
        type: Date,
        required: true,
        validate: {
            validator: dateInFuture,
            message: 'End date has to be in the future.'
        }
    },
    description: {
        type: String,
        maxlength: [1000, 'Description maximum length is 1000 characters.']
    },
    posterURL: String,
    documentURL: Array,
    attendanceRequired: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
});

//validating one parameter based on the other one
//pre function attaches a callback to a specified middleware function, in this case 'validate'
eventSchema.pre('validate', function(next){
    if (this.startTime >= this.endTime) {
        this.invalidate('startTime', 'Start time must be before end time.', this.startTime);
    }   

    next();
});

const Event = module.exports = Mongoose.model('event', eventSchema, 'events');