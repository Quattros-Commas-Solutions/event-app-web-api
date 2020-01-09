var Mongoose = require('mongoose');

var eventGroupSchema = Mongoose.Schema({
    eventID: {
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

var EventGroup = module.exports = Mongoose.model('eventGroup', eventGroupSchema, 'eventGroups');