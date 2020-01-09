var Mongoose = require('mongoose');

var inviteSchema = Mongoose.Schema({
    userID: {
        type: ObjectId,
        required: true
    },
    eventID: {
        type: ObjectId,
        required: true
    },
    responseType:{
        type: Number,
        required: true,
        default: 0
    },
    qrcode: String
});

var Invite = module.exports = Mongoose.model('invite', inviteSchema);