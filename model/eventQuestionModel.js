var Mongoose = require('mongoose');

var eventQuestionSchema = Mongoose.Schema({
    eventID: {
        type: ObjectId,
        required: true
    },
    userID: {
        type: ObjectId,
        required: true
    },
    content: {
        type: String,
         required: true
    },
    responses: {
        type: Array
    }
});

var EventQuestion = module.exports = Mongoose.model('eventQuestion', eventQuestionSchema);