const Mongoose = require('mongoose');

const SimpleUserSchema = require('./schema/simpleUserSchema');

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
            user: {
                type: SimpleUserSchema,
                required: [true, 'Question response has to have user data']
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