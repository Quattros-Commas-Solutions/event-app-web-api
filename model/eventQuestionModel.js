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
        type: [new Mongoose.Schema({
            'content': {
                type: String,
                required: true
            },
            user: {
                type: new Mongoose.Schema({
                    id: {
                        type: String,
                        required: true,
                        trim: true
                    },
                    name: {
                        type: String,
                        required: true,
                        trim: true
                    },
                    surname: {
                        type: String,
                        required: true,
                        trim: true
                    },
                    profilePic: {
                        type: String,
                        required: true,
                        trim: true
                    }
                })
            }
        })],
        required: false
    }
});

const EventQuestion = module.exports = Mongoose.model('eventQuestion', eventQuestionSchema, 'eventQuestions');