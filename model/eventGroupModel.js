const Mongoose = require('mongoose');

const SimpleUserSchema = require('./schema/simpleUserSchema');

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
        required: [true, 'Group name must be specified'],
        minlength: [1, 'Event group name must be at least 1 character long'],
        maxlength: [255, 'Event group name cannot be longer than 255 characters']
    },
    users: {
        type: [{
            type: SimpleUserSchema
        }],
        required: [true, 'List of group users must be provided']
    }
});

const EventGroup = module.exports = Mongoose.model('eventGroup', eventGroupSchema, 'eventGroups');