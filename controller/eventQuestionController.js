const HttpStatus = require('http-status-codes');
const Mongoose = require('mongoose');
const ObjectId = Mongoose.Types.ObjectId;

const EventQuestion = require('../model/eventQuestionModel');
const Event = require('../model/eventModel');
const ValidationUtil = require('../util/validationUtil');
const StatusEnum = require('../model/enums').StatusEnum;
const ResponseTypeEnum = require('../model/enums').ResponseTypeEnum;
const Invite = require('../model/inviteModel');

const create = (req, res) => {

    const user = req.decoded;

    if (!user || !req.body) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request.'
        });
    }

    let eventQuestion = new EventQuestion(req.body);
    // this way we can send 2 parameters less in the request
    eventQuestion.userID = user._id;
    eventQuestion.companyID = user.companyID;


    // we must make sure that it is an event of the company the user is part and that the user has accepted the invitation
    Event.findOne({ _id: new ObjectId(eventQuestion.eventID), companyID: new ObjectId(eventQuestion.companyID) }).then(event => {
        if (!event) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Bad request. Invalid event ID.'
            });
        }
        Invite.findOne({ eventID: event._id, userID: user._id, responseType: ResponseTypeEnum['Accepted'] }).then(invite => {
            if (invite) {
                eventQuestion.save().then(newEventQuestion => {
                    return res.status(HttpStatus.CREATED).json(newEventQuestion);
                }).catch(err => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        message: ValidationUtil.buildErrorMessage(err, 'create', 'eventQuestion')
                    });
                });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Bad request. User is not part of event.'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error.'
            });
        });
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: ValidationUtil.buildErrorMessage(err, 'create', 'eventQuestion')
        });
    });

};

const getAllHelper = (req, res, companyID) => {
    EventQuestion.find({ companyID }, { __v: 0 }).then(eventQuestions => {
        return res.status(HttpStatus.OK).json(eventQuestions);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error.'
        });
    });
}

const getAll = (req, res) => {

    const user = req.decoded;
    const eventID = req.params.event_id;

    if (!user || !ValidationUtil.isValidObjectId(eventID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request'
        });
    }

    // if it is an admin level user, he can get all questions regardless of invite or not => GOOD, BAD? Discuss
    if (ValidationUtil.isUserAdmin(user.accessType)) {
        return getAllHelper(req, res, user.companyID)
    } else {
        Invite.findOne({ eventID: new ObjectId(eventID), userID: user._id, responseType: ResponseTypeEnum['Accepted'] }).then(invite => {
            if (invite) {
                return getAllHelper(req, res, user.companyID);
            } else {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    message: 'User is not part of event.'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error.'
            });
        });
    }

};

const getByIdHelper = (req, res, eventQuestionID, companyID) => {
    EventQuestion.findOne({ _id: eventQuestionID, companyID }, { __v: 0 }).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Event question not found.'
            });
        }
        return res.status(HttpStatus.OK).json(eventQuestion);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error.'
        });
    });
};

const getById = (req, res) => {

    const eventQuestionID = req.params.id;
    const user = req.decoded;

    if (!ValidationUtil.isValidObjectId(eventQuestionID) || !user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request'
        });
    }

    if (ValidationUtil.isUserAdmin(user.accessType)) {
        return getByIdHelper(req, res, new ObjectId(eventQuestionID), user.companyID);
    } else {
        Invite.findOne({ eventID: new ObjectId(eventID), userID: user._id, responseType: ResponseTypeEnum['Accepted'] }, { __v: 0 }).then(invite => {
            if (invite) {
                return getByIdHelper(req, res, new ObjectId(eventQuestionID), user.companyID);
            } else {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    message: 'User is not part of event.'
                });
            }
        }).catch(err => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error.'
            });
        })
    }

}

const deleteById = (req, res) => {

    const eventQuestionID = req.params.id;
    const user = req.decoded;

    if (!ValidationUtil.isValidObjectId(eventQuestionID) || !user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request'
        });
    }

    EventQuestion.findOneAndDelete({ _id: new ObjectId(eventQuestionID), companyID: user.companyID }).then(eventQuestion => {
        if (eventQuestion) {
            return res.status(HttpStatus.OK).json(eventQuestion);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Event question not found'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: ValidationUtil.buildErrorMessage(err, 'delete', 'eventQuestion')
        });
    });

};

const addResponseToEventHelper = (req, res, eventQuestionID, companyID, response) => {
    // allow commenting only on company events
    EventQuestion.findOneAndUpdate({ _id: eventQuestionID, companyID }, { $push: { responses: response } }, { useFindAndModify: false, new: true, runValidators: true }).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Event question not found'
            });
        }
        return res.status(HttpStatus.OK).json(eventQuestion.responses[eventQuestion.responses.length - 1]); // return last entry; TODO: find a better way: perhaps sort by time and take last one
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: ValidationUtil.buildErrorMessage(err, 'update', 'eventQuestion')
        });
    });
};

const addResponseToEvent = (req, res) => {

    const eventQuestionID = req.body.id;
    const content = req.body.content;
    const user = req.decoded;

    if (!content || !ValidationUtil.isValidObjectId(eventQuestionID) || !user || !ValidationUtil.isValidObjectId(user.companyID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    const response = {
        content,
        user: {
            id: user._id,
            name: user.name,
            surname: user.surname,
            profilePic: user.profilePic ? user.profilePic : ''
        }
    };

    if (ValidationUtil.isUserAdmin(user.accessType)) {
        return addResponseToEventHelper(req, res, new ObjectId(eventQuestionID), user.companyID, response);
    } else {
        Invite.findOne({ userID: user._id, eventID: new ObjectId(eventQuestionID), responseType: ResponseTypeEnum['Accepted'] }, { __v: 0 }).then(invite => {
            if (invite) {
                return addResponseToEventHelper(req, res, new ObjectId(eventQuestionID), user.companyID, response);
            } else {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    message: 'Unauthorized'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Unauthorized'
            });
        });
    }

};

// only content is update-able
const update = (req, res) => {

    const eventQuestionID = req.body.id;
    const content = req.body.content;
    const user = req.decoded;

    if (!content || !ValidationUtil.isValidObjectId(eventQuestionID) || !user || !ValidationUtil.isValidObjectId(user.companyID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request'
        });
    }

    // question can only be updated by the one who asked it, no need to check for invite since that check is done while creating the question
    EventQuestion.findOneAndUpdate({
        _id: new ObjectId(eventQuestionID),
        userID: user._id,
        companyID: new ObjectId(user.companyID)
    }, { content }, { useFindAndModify: false, new: true, runValidators: true }).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Event not found'
            });
        }
        return res.status(HttpStatus.OK).json(eventQuestion);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: ValidationUtil.buildErrorMessage(err, 'update', 'eventQuestion')
        });
    });

}

// only Super-Admin/Admin level users will be able to delete responses
const deleteResponse = (req, res) => {

    const responseID = req.params.responseID;
    const eventQuestionID = req.params.eventQuestionID;
    const user = req.decoded;

    if (!ValidationUtil.isValidObjectId(responseID) || !ValidationUtil.isValidObjectId(eventQuestionID) || !user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request'
        });
    }

    EventQuestion.findOneAndUpdate({ _id: new ObjectId(eventQuestionID), companyID: new ObjectId(user.companyID) }, { $pull: { responses: { _id: responseID } } }, { useFindAndModify: false, new: true, runValidators: true }).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Not found'
            });
        }
        return res.status(HttpStatus.OK).json(eventQuestion);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: ValidationUtil.buildErrorMessage(err, 'delete', 'response')
        });
    });

};

module.exports = {
    create,
    getById,
    getAll,
    deleteById,
    addResponseToEvent,
    update,
    deleteResponse
};