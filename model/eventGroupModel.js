const Mongoose = require('mongoose');

const eventGroupSchema = Mongoose.Schema({
    eventID: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    companyID: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    users: {
        type: Array,
        required: true
    }
});

const EventGroup = module.exports = Mongoose.model('eventGroup', eventGroupSchema, 'eventGroups');