var Mongoose = require('mongoose');

var eventSchema = Mongoose.Schema({
    companyID: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: Object,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    description: String,
    posterURL: String,
    documentURL: Array,
    attendanceRequired: {
        type: Boolean,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
});

var Event = module.exports = Mongoose.model('event', eventSchema, 'events');