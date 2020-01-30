const Mongoose = require('mongoose');

const eventGroupSchema = Mongoose.Schema({
    eventID: {
        type: Mongoose.Types.ObjectId,
        required: [true, 'Event ID must be specified']
    },
    companyID: {
        type: Mongoose.Types.ObjectId,
        required: [true, 'Company ID must be specified']
    },
    name: {
        type: String,
        required: [true, 'Group name must be specified']
    },
    users: {
        type: Array,
        required: [true, 'List of group users must be provided']
    }
});

const EventGroup = module.exports = Mongoose.model('eventGroup', eventGroupSchema, 'eventGroups');