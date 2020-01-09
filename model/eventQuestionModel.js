const Mongoose = require('mongoose');

const eventQuestionSchema = Mongoose.Schema({
    eventID: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    userID: {
        type: Mongoose.Types.ObjectId,
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

const EventQuestion = module.exports = Mongoose.model('eventQuestion', eventQuestionSchema, 'eventQuestions');