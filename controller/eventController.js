const Event = require('../model/eventModel');
const Invite = require('../model/inviteModel');
const HttpStatus = require('http-status-codes');
const ObjectId = require('mongoose').Types.ObjectId;

const ValidationUtil = require('../util/validationUtil');
const StatusEnum = require('../model/enums').StatusEnum;

const create = (req, res) => {
    const user = req.decoded;

    //Only admins can create event objets
    if (!user || !ValidationUtil.isUserAdmin(user.accessType)) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            status: StatusEnum['ERROR'],
            message: 'Unauhorized.'
        })
    }

    const event = new Event(req.body);

    event.save().then(() => {
        return res.status(HttpStatus.OK).json(event);
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'event');
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: errorMessage
        });
    });
};

const retrieveAll = (req, res) => {
    const user = req.decoded;
    const companyId = user.companyID;

    //All events can only be retrieved by an admin for the admin app
    if (user && ValidationUtil.isUserAdmin(user.accessType)) {
        //Retrieving only events for the company of the admin
        Event.find({ companyID: companyId }).then((events) => {
            if (events) {
                return res.status(HttpStatus.OK).json(events);
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: StatusEnum['ERROR'],
                    message: 'Events not found.'
                })
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: StatusEnum['ERROR'],
                message: 'Internal server error.'
            });
        });
        //Regulal users can get all of the events where they are invited    
    } else if (user && !ValidationUtil.isUserAdmin(user.accessType)) {
        //TODO: Discuss better and faster solutions for this
        Invite.find({ userID: new ObjectId(user._id) }).then(invites => {
            if (!invites) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: StatusEnum['ERROR'],
                    message: 'No events for user.'
                });
            } else {
                //First we extract the event id's from invites
                let eventIDs = [];
                invites.forEach(invite => {
                    eventIDs.push(new ObjectId(invite.eventID));
                });
                //Now we find all the events for the event ids
                Event.find({ '_id': { $in: eventIDs } }).then(events => {
                    if (events) {
                        return res.status(HttpStatus.OK).json(events);
                    } else {
                        return res.status(HttpStatus.NOT_FOUND).json({
                            status: StatusEnum['ERROR'],
                            message: 'No events for user.'
                        });
                    }
                }).catch(err => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        status: StatusEnum['ERROR'],
                        message: 'Internal server error'
                    });
                })
            }
        });
    } else { //Case where the user is not authorized
        return res.status(HttpStatus.UNAUTHORIZED).json({
            status: StatusEnum['ERROR'],
            message: 'Unauthorized access.'
        });
    }


};

const retrieveById = (req, res) => {
    const eventId = req.params.id;
    const user = req.decoded;

    if (!eventId || !user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
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
                        }else{
                            return res.status(HttpStatus.NOT_FOUND).json({
                                status: StatusEnum['ERROR'],
                                message: 'Event not found.'
                            });
                        }
                    }).catch(err => {
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                            status: StatusEnum['ERROR'],
                            message: 'Internal server error.'
                        });
                    });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Event not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: 'Internal server error.'
        });
    });
};

const update = (req, res) => {
    const userCompanyId = req.decoded.companyID;
    const eventId = req.params.id;

    Event.findById(eventId).then((event) => {
        event
    })
};

module.exports = {
    create,
    retrieveAll,
    retrieveById,
    update
};