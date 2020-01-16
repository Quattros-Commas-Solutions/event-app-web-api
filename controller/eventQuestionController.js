const HttpStatus = require('http-status-codes');
const Mongoose = require('mongoose');

const EventQuestion = require('../model/eventQuestionModel');
const Event = require('../model/eventModel');
const ValidationUtil = require('../util/validationUtil');
const StatusEnum = require('../model/enums').StatusEnum;

const create = (req, res) => {

    const eventQuestion = new EventQuestion(req.body);

    eventQuestion.save().then(() => {
        return res.status(HttpStatus.CREATED).json(eventQuestion);
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'eventQuestion');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: errorMessage
        });
    });

};

const getById = (req, res) => {

    const eventQuestionId = req.params.id;
    const user = req.decoded;

    if (!ValidationUtil.isValidObjectId(eventQuestionId)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    if (!ValidationUtil.isUserAdmin(user.accessType)) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            status: StatusEnum['ERROR'],
            message: 'Unauthorized'
        });
    }

    EventQuestion.findById(eventQuestionId, { _id: 0 }).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Event question not found'
            });
        } else {
            Event.findOne({ _id: new Mongoose.Types.ObjectId(eventQuestion.eventID), companyID: new Mongoose.Types.ObjectId(user.companyID) }, { _id: 0 }).then(event => {
                if (event) {
                    return res.status(HttpStatus.OK).json(eventQuestion);
                } else {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        status: StatusEnum['ERROR'],
                        message: 'Event not found'
                    });
                }
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: 'Internal server error'
        });
    });

}

const deleteById = (req, res) => {

    const eventQuestionId = req.params.id;
    const user = req.decoded;

    if (!ValidationUtil.isValidObjectId(eventQuestionId)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    if (!ValidationUtil.isUserAdmin(user.accessType)) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            status: StatusEnum['ERROR'],
            message: 'Unauthorized'
        });
    }

    EventQuestion.findByIdAndDelete(eventQuestionId).then(eventQuestion => {
        if (eventQuestion) {
            // since it is a simple delete, should a boolean value be returned or the entire object => DISCUSS
            return res.status(HttpStatus.OK).json(eventQuestion);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Event question not found'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: ValidationUtil.buildErrorMessage(err, 'delete', 'eventQuestion')
        });
    });

}

const addResponseToEvent = (req, res) => {
    const eventQuestionId = req.body.id;
    const content = req.body.content;
    const user = req.decoded;

    if (!user || !content || !ValidationUtil.isValidObjectId(eventQuestionId)) {
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

    EventQuestion.findById(eventQuestionId).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Event question not found'
            });
        } else {
            // allow commenting only on company events; TODO: additional check if user has accepted invite for event (after test data and controller for invite are made)
            Event.findOne({ _id: new Mongoose.Types.ObjectId(eventQuestion.eventID), companyID: new Mongoose.Types.ObjectId(user.companyID) }).then(event => {
                if (!event) {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        status: StatusEnum['ERROR'],
                        message: 'Event not found'
                    });
                } else {
                    eventQuestion.updateOne({ $push: { responses: response } }, { useFindAndModify: false, new: true, runValidators: true }).then(() => {
                        return res.status(HttpStatus.OK).json(response);
                    }).catch(err => {
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                            status: StatusEnum['ERROR'],
                            message: ValidationUtil.buildErrorMessage(err, 'update', 'eventQuestion')
                        });
                    });
                }
            }).catch(err => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    status: StatusEnum['ERROR'],
                    message: 'Internal server error'
                });
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: 'Internal server error'
        });
    });

};

// only content is update-able
const update = (req, res) => {
    const eventQuestionId = req.body.id;
    const content = req.body.content;
    const user = req.decoded;

    if (!content || !ValidationUtil.isValidObjectId(eventQuestionId) || !user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    EventQuestion.findById(eventQuestionId).then(eventQuestion => {
        // use object destructuring to simplify names: {companyID} instead event, so later on it is companyID and not event.companyID
        Event.findById(eventQuestion.eventID, { companyID: 1 }).then(({ companyID }) => {
            if (companyID && user.companyID.toString() === companyID.toString()) {
                eventQuestion.updateOne({ content }, { useFindAndModify: false, new: true, runValidators: true }).then(() => {
                    // new: true is ignored for some reason
                    eventQuestion.content = content;
                    return res.status(HttpStatus.OK).json(eventQuestion);
                }).catch(err => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        status: StatusEnum['ERROR'],
                        message: ValidationUtil.buildErrorMessage(err, 'update', 'eventQuestion')
                    });
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: StatusEnum['ERROR'],
                    message: 'Event not found'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: StatusEnum['ERROR'],
                message: 'Internal server error'
            });
        });
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: 'Internal server error'
        });
    });

}

// only Super-Admin/Admin level users will be able to delete responses
const deleteResponse = (req, res) => {
    const responseId = req.params.responseId;
    const eventQuestionId = req.params.eventQuestionId;
    const user = req.decoded;

    if (!ValidationUtil.isUserAdmin(user.accessType)) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            status: StatusEnum['ERROR'],
            message: 'Unauthorized'
        });
    }

    if (!ValidationUtil.isValidObjectId(responseId) || !ValidationUtil.isValidObjectId(eventQuestionId)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    // consider adding companyID to eventQuestion as well, it would make things a lot easier whilst querying
    EventQuestion.findById(eventQuestionId).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Not found'
            });
        }
        Event.findById(eventQuestion.eventID, { companyID: 1 }).then(({ companyID }) => {
            if (companyID && user.companyID.toString() === companyID.toString()) {
                EventQuestion.findByIdAndUpdate(eventQuestionId, { $pull: { responses: { _id: responseId } } }).then(eq => {
                    if (!eq) {
                        return res.status(HttpStatus.NOT_FOUND).json({
                            status: StatusEnum['ERROR'],
                            message: 'Not found'
                        });
                    }
                    return res.status(HttpStatus.OK).json(eq);
                }).catch(err => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        status: StatusEnum['ERROR'],
                        message: 'Internal server error'
                    });
                })
            } else {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    status: StatusEnum['ERROR'],
                    message: 'Unauthorized'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: StatusEnum['ERROR'],
                message: 'Internal server error'
            });
        });
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: 'Internal server error'
        });
    });
}

// possible other functions to add: delete after specified time - could be useful for events that have passed
module.exports = {
    create,
    getById,
    deleteById,
    addResponseToEvent,
    update,
    deleteResponse
};