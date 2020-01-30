const HttpStatus = require('http-status-codes');

const Notification = require('../model/notificationModel');
const ValidationUtil = require('../util/validationUtil');
const Invite = require('../model/inviteModel');
const ResponseTypeEnum = require('../model/enums').ResponseTypeEnum;
const User = require('../model/userModel');


const create = (req, res) => {

    const user = req.decoded;

    if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request.'
        });
    }

    let notification = new Notification(req.body);
    notification.companyID = user.companyID;

    notification.save().then(newNotification => {
        Invite.find({
            eventID: newNotification.eventID,
            responseType: ResponseTypeEnum['Accepted']
        }, {
            userID: 1 // only need the userID - cut down on network traffic
        }).then(invites => {
            const userIDs = invites.map(invite => invite.userID);
            // User.update()
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error.'
            });
        });
    }).catch(err => {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: ValidationUtil.buildErrorMessage(err, 'create', 'notification')
        });
    });

};