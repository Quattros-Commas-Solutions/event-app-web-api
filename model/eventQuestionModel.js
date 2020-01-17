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
    companyID: {
        type: Mongoose.Types.ObjectId,
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'Question content cannot be left blank']
    },
    responses: {
        type: [new Mongoose.Schema({
            content: {
                type: String,
                required: true,
                trim: true
            },
            user: { // a simplified version of the user is stored - maybe just store the ID, but then there will be an influx of queries whilst showing the Q&A section => DISCUSS
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
                        default: null,
                        trim: true
                    }
                })
            }
        }, {
            timestamps: true // contains createdAt and updatedAt fields, which are what we need
        })],
        required: false,
        default: []
    }
}, {
    timestamps: true
});

const EventQuestion = module.exports = Mongoose.model('eventQuestion', eventQuestionSchema, 'eventQuestions');