const HttpStatus = require('http-status-codes');
const ObjectId = require('mongoose').Types.ObjectId;

const Event = require('../model/eventModel');
const Invite = require('../model/inviteModel');
const User = require('../model/userModel');
const ValidationUtil = require('../util/validationUtil');
const ResponseTypeEnum = require('../model/enums').ResponseTypeEnum;
const UserTypeEnum = require('../model/enums').UserTypeEnum;
const emailUtil = require('../util/emailUtil');

const create = (req, res) => {
    const user = req.decoded;

    //Only admins can create event objects
    if (!user || !ValidationUtil.isUserAdmin(user.accessType)) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauhorized.'
        });
    }

    let event = new Event(req.body);
    event.companyID = user.companyID;

    event.save().then(() => {
        return res.status(HttpStatus.OK).json(event);
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'event');
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: errorMessage
        });
    });
};

const getAll = (req, res) => {
    const user = req.decoded;
    const companyId = user.companyID;

    //user must be valid to retrieve any events
    if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized access.'
        });
    }

    //All events can only be retrieved by an admin for the admin app
    if (ValidationUtil.isUserAdmin(user.accessType)) {
        //Retrieving only events for the company of the admin
        Event.find({ companyID: companyId }).then((events) => {
            if (events) {
                return res.status(HttpStatus.OK).json(events);
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Events not found.'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error.'
            });
        });
        //Regulal users can get all of the events where they are invited    
    } else {
        //TODO: Discuss better and faster solutions for this
        Invite.find({ userID: new ObjectId(user._id) }).then(invites => {
            if (!invites) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'No events for user.'
                });
            } else {
                //First we extract the event id's from invites
                let eventIDs = [];
                invites.forEach(invite => {
                    if (invite.responseType !== ResponseTypeEnum['Declined']) {
                        eventIDs.push(new ObjectId(invite.eventID));
                    }
                });
                //Now we find all the events for the event ids
                Event.find({ '_id': { $in: eventIDs } }).then(events => {
                    if (events) {
                        return res.status(HttpStatus.OK).json(events);
                    } else {
                        return res.status(HttpStatus.NOT_FOUND).json({
                            message: 'No events for user.'
                        });
                    }
                }).catch(err => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        message: 'Internal server error'
                    });
                });
            }
        });
    }
};

const getById = (req, res) => {
    const eventId = req.params.id;
    const user = req.decoded;

    if (!eventId || !user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request'
        });
    }

    Event.findOne({
        _id: new ObjectId(eventId),
        companyID: new ObjectId(user.companyID)
    }).then(event => {
        if (event) {
            //If the user is admin then we can send him the event
            if (ValidationUtil.isUserAdmin(user.accessType)) {
                return res.status(HttpStatus.OK).json(event);
                //If the user is regular, we need to check for the invite
            } else {
                Invite.findOne({ userID: new ObjectId(user._id), eventID: new ObjectId(event._id) })
                    .then(invite => {
                        if (invite) { //If the invite exists we return the event
                            return res.status(HttpStatus.OK).json(event);
                        } else {
                            return res.status(HttpStatus.NOT_FOUND).json({
                                message: 'Event not found.'
                            });
                        }
                    }).catch(err => {
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                            message: 'Internal server error.'
                        });
                    });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Event not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error.'
        });
    });
};

const update = (req, res) => {
    const eventId = req.params.id;
    const user = req.decoded;

    //Only admins can update event objects
    if (!user || !ValidationUtil.isUserAdmin(user.accessType)) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauhorized.'
        });
    }

    Event.findOneAndUpdate({ _id: new ObjectId(eventId), companyID: new ObjectId(user.companyID) },
        req.body, { runValidators: true, new: true }).then(event => {
            if (event) {
                // find event participants
                Invite.find({ eventID: event._id, responseType: ResponseTypeEnum['Accepted'] }, { userID: 1 }).then(invites => {
                    const userIDs = invites.map(invite => invite.userID);
                    // get user mails
                    User.find({ _id: { $in: userIDs } }, { email: 1 }).then(users => {
                        const emails = users.map(u => u.email);
                        // now get admin mails for cc - this is done separately since not all admins are part of all events and 
                        // the idea at the moment is to include all admins in the mail as cc
                        User.find({ companyID: user.companyID, accessType: { $in: [UserTypeEnum['Admin'], UserTypeEnum['Super-Admin']] } }, { email: 1 }).then(adminUsers => {
                            const adminEmails = adminUsers.map(adminUser => adminUser.email);
                            if (emailUtil.sendEmail(`${event.name} - Update`, 'Event details have been updated. Check out what\' changed.', emails, adminEmails)) {
                                return res.status(HttpStatus.OK).json(event);
                            } else {
                                // what to do? update went fine, but fails at sending emails
                                return res.status(HttpStatus.OK).json(event);
                            }
                        }).catch(err => {
                            // what to do? update went fine, but fails at user get
                            return res.status(HttpStatus.OK).json(event);
                        });
                    }).catch(err => {
                        // what to do? update went fine, but fails at user get
                        return res.status(HttpStatus.OK).json(event);
                    });
                }).catch(err => {
                    // what to do? update went fine, but fails at invite get
                    return res.status(HttpStatus.OK).json(event);
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Event not found.'
                });
            }
        }).catch(err => {
            const errorMessage = ValidationUtil.buildErrorMessage(err, 'update', 'event');
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: errorMessage
            });
        });
};

//Remove only sets the active field to false, the event stays in the database
const remove = (req, res) => {
    const eventId = req.params.id;
    const user = req.decoded;

    //Only admins can remove event objects
    if (!user || !ValidationUtil.isUserAdmin(user.accessType)) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauhorized.'
        });
    }

    Event.findOneAndUpdate({ _id: new ObjectId(eventId), companyID: new ObjectId(user.companyID) },
        { active: false }, { new: true })
        .then(event => {
            if (event) {
                return res.status(HttpStatus.OK).json(event);
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Event not found.'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error.'
            });
        });
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove
};