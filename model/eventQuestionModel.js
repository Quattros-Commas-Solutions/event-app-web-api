const Mongoose = require('mongoose');

const eventQuestionSchema = Mongoose.Schema({
    eventID: {
        type: Mongoose.Types.ObjectId,
        required: [true, 'Event ID must be specified']
    },
    userID: {
        type: Mongoose.Types.ObjectId,
        required: [true, 'User ID must be specified']
    },
    companyID: {
        type: Mongoose.Types.ObjectId,
        required: [true, 'Company ID must be specified']
    },
    content: {
        type: String,
        required: [true, 'Question content must be specified'],
        trim: true,
        minlength: [1, 'Question content cannot be left blank'],
        maxlength: [400, 'Question length cannot be more than 400 characters']
    },
    responses: {
        type: [new Mongoose.Schema({
            content: {
                type: String,
                required: [true, 'Response content must be specified'],
                trim: true,
                minlength: [1, 'Response can not be left empty'],
                maxlength: [400, 'Response lenght cannot be more than 400 characters']
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
                        required: [true, 'Response posters name must be specified'],
                        trim: true
                    },
                    surname: {
                        type: String,
                        required: [true, 'Response posters surname must be specified'],
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