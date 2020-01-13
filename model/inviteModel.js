const Mongoose = require('mongoose');

const inviteSchema = Mongoose.Schema({
    userID: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    eventID: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    responseType: {
        type: Number,
        required: true,
        default: 0
    },
    qrcode: String
});

const Invite = module.exports = Mongoose.model('invite', inviteSchema, 'invites');