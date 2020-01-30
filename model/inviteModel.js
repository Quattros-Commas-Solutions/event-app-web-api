const Mongoose = require('mongoose');

const inviteSchema = Mongoose.Schema({
    userID: {
        type: Mongoose.Types.ObjectId,
        required: [true, 'User ID must be specified']
    },
    eventID: {
        type: Mongoose.Types.ObjectId,
        required: [true, 'Event ID must be specified']
    },
    responseType: {
        type: Number,
        required: [true, 'Invite response must be specified'],
        default: 0,
        enum: [[0, 1, 2], 'Invalid response type value']
    },
    qrcode: String
});

const Invite = module.exports = Mongoose.model('invite', inviteSchema, 'invites');