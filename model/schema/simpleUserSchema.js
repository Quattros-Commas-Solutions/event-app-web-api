const Mongoose = require('mongoose');

const simpleUserSchema = Mongoose.Schema({
    id: {
        type: String,
        required: true,
        trim: true,
        
    },
    name: {
        type: String,
        required: [true, 'Commenters name must be specified'],
        trim: true,
        minlength: [1, 'Commenters name must be at least 1 character long'],
        maxlength: [255, 'Commenters name cannot be longer than 255 characters']
    },
    surname: {
        type: String,
        required: [true, 'Commenters surname must be specified'],
        trim: true,
        minlength: [1, 'Commenters surname must be at least 1 character long'],
        maxlength: [255, 'Commenters surname cannot be longer than 255 characters']
    },
    profilePic: {
        type: String,
        default: '',
        trim: true
    }
});

module.exports = simpleUserSchema;