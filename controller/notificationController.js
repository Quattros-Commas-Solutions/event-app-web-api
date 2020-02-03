const HttpStatus = require('http-status-codes');
const ObjectId = require('mongoose').Types.ObjectId;

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
        // send new notification only to those that have accepted the invite
        // we could probably add some sort of message queue for those whose status is pending so that when they accept they 
        // can receive all those notifications to that they don't miss anything
        Invite.find({
            eventID: newNotification.eventID,
            responseType: ResponseTypeEnum['Accepted']
        }, {
            userID: 1 // only need the userID - cut down on network traffic
        }).then(invites => {
            const userIDs = invites.map(invite => invite.userID);
            User.updateMany({
                _id: {
                    $in: userIDs
                }
            }, {
                $push: {
                    notifications: {
                        notificationID: newNotification._id
                    }
                }
            }).then(() => {
                return res.status(HttpStatus.CREATED).json(newNotification);
            }).catch(err => {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: ValidationUtil.buildErrorMessage(err, 'create', 'notification')
                });
            });
        }).catch(() => {
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

const getAll = (req, res) => {

    const user = req.decoded;
    const read = req.params.read;

    if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request.'
        });
    }

    const notificationIDs = user.notifications.filter(notification => notification.read.toString() == read).map(notification => notification.notificationID);

    Notification.find({
        _id: {
            $in: notificationIDs
        }
    }).then(notifications => {
        return res.status(HttpStatus.OK).json(notifications);
    }).catch(() => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    });

};

// I don't think admins should be able to delete notifications
// Maybe we should make them delete automatically after event is marked as finished, dunno => DISCUSS

const deleteById = (req, res) => {

    const user = req.decoded;
    const notificationID = req.params.id;

    if (!user || !ValidationUtil.isValidObjectId(notificationID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request.'
        });
    }

    // first check that notification exists
    Notification.findOneAndDelete({ _id: new ObjectId(notificationID), companyID: user.companyID}).then(notification => {
        if (notification) {
            // find users you need to update
            Invite.find({
                eventID: notification.eventID,
                responseType: ResponseTypeEnum['Accepted']
            }, {
                userID: 1 
            }).then(invites => {
                const userIDs = invites.map(invite => invite.userID);
                User.updateMany({
                    _id: {
                        $in: userIDs
                    }
                }, {
                    $pull: {
                        notifications: {
                            notificationID: notification._id
                        }
                    }
                }).then(() => {
                    return res.status(HttpStatus.OK).json(true);
                }).catch(err => {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        message: ValidationUtil.buildErrorMessage(err, 'delete', 'notification')
                    });
                });
            }).catch(() => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Internal server error.'
                });
            });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Notification not found'
            });
        }
    }).catch(() => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    });

};

const getById = (req, res) => {

    const user = req.decoded;
    const notificationID = req.params.id;

    if (!user || !ValidationUtil.isValidObjectId(notificationID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request.'
        });
    }

    const present = user.notifications.filter(notification => notification.notificationID.toString() === notificationID).length !== 0;

    if (present) {
        Notification.findById(notificationID).then(notification => {
            if (notification) {
                return res.status(HttpStatus.OK).json(notification);
            }
            // INTERNAL_SERVER_ERROR is sent here since the id exists in the user's notifications property so he would 
            // expect to be able to get said notification
            return res.status.json(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error. Notification is not available.'
            });
        }).catch(() => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error'
            });
        })
    } else {
        return res.status(HttpStatus.NOT_FOUND).json({
            message: 'Notification not found'
        });
    }

};

module.exports = {
    create,
    getAll,
    getById,
    deleteById
};