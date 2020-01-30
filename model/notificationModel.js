const Mongoose = require('mongoose');

const notificationSchema = Mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'Notification title cannot be left empty'],
        maxlength: [100, 'Notification title cannot be longer than 100 characters']
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'Notification content cannot be left empty'],
        maxlength: [500, 'Notification content cannot be longer than 500 characters']
    }, 
    eventID: {
        required: true, 
        type: Mongoose.Types.ObjectId, 
        ref: 'events'
    }, 
    companyID: {
        required: true, 
        type: Mongoose.Types.ObjectId, 
        ref: 'companies'
    }
});

const Notification = module.exports = Mongoose.model('notification', notificationSchema, 'notifications');