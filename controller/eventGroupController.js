const HttpStatus = require('http-status-codes');

const EventGroup = require('../model/eventGroupModel');
const Event = require('../model/eventModel');
const ValidationUtil = require('../util/validationUtil');
const StatusEnum = require('../model/enums').StatusEnum;


// =================================== CRUD FUNCTIONS ===================================


const create = (req, res) => {
    const loggedUser = req.decoded;

    if (!loggedUser || !req.body) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }
    // TODO: AdminAuth MW
    // TODO: add new user to eventGroup (update eventGroup.users)
    // TODO: remove user from eventGroup
    const eventGroup = new EventGroup(req.body);
    if (!ValidationUtil.isValidObjectId(eventGroup.eventID.toString()) || !ValidationUtil.isValidObjectId(loggedUser.companyID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Invalid ID'
        });
    }

    // Check if event exists 
    Event.findOne({ _id: eventGroup.eventID, companyID: loggedUser.companyID }).then(event => {
        if (event) {
            eventGroup.save().then(() => {
                return res.status(HttpStatus.CREATED).json(eventGroup);
            }).catch(err => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    status: StatusEnum['ERROR'],
                    message: ValidationUtil.buildErrorMessage(err, 'create', 'eventGroup')
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
            message: ValidationUtil.buildErrorMessage(err, 'create', 'eventGroup')
        });
    });
};

const retrieveAll = (req, res) => {
    const loggedUser = req.decoded;

    if (!ValidationUtil.isValidObjectId(loggedUser.companyID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Invalid ID'
        });
    }

    if (ValidationUtil.isUserAdmin(loggedUser.accessType)) {
        // If a user is (super)admin he can retrieve all event groups within his company
        EventGroup.find({ companyID: loggedUser.companyID }).then(eventGroups => {
            if (eventGroups) {
                return res.status(HttpStatus.OK).json(eventGroups);
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: StatusEnum['ERROR'],
                    message: 'Event groups not found.'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: StatusEnum['ERROR'],
                message: ValidationUtil.buildErrorMessage(err, 'retrieveAll', 'eventGroup')
            });
        });
    } else {
        // Employees can only retrieve event groups in which they're part of
        EventGroup.find({ companyID: loggedUser.companyID, users: { "$in": [loggedUser._id] } }).then(eventGroups => {
            if (eventGroups) {
                return res.status(HttpStatus.OK).json(eventGroups);
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: StatusEnum['ERROR'],
                    message: 'Event groups not found.'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: StatusEnum['ERROR'],
                message: ValidationUtil.buildErrorMessage(err, 'retrieveAll', 'eventGroup')
            });
        });
    }
}

const retrieveById = (req, res) => {
    const eventGroupId = req.params.id;
    const loggedUser = req.decoded;

    if (!ValidationUtil.isValidObjectId(eventGroupId) || !ValidationUtil.isValidObjectId(loggedUser.companyID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'Invalid ID'
        });
    }

    if (ValidationUtil.isUserAdmin(loggedUser.accessType)) {
        // If a user is (super)admin he can retrieve all event groups within his company
        EventGroup.find({ _id: eventGroupId, companyID: loggedUser.companyID }).then(eventGroups => {
            if (eventGroups) {
                return res.status(HttpStatus.OK).json(eventGroups);
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: StatusEnum['ERROR'],
                    message: 'Event group not found.'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: StatusEnum['ERROR'],
                message: ValidationUtil.buildErrorMessage(err, 'retrieveAll', 'eventGroup')
            });
        });
    } else {
        // Employees can only retrieve event groups in which they're part of
        EventGroup.find({ _id: eventGroupId, companyID: loggedUser.companyID, users: { "$in": [loggedUser._id] } }).then(eventGroups => {
            if (eventGroups) {
                return res.status(HttpStatus.OK).json(eventGroups);
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: StatusEnum['ERROR'],
                    message: 'Event group not found.'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: StatusEnum['ERROR'],
                message: ValidationUtil.buildErrorMessage(err, 'retrieveAll', 'eventGroup')
            });
        });
    }
};

const update = (req, res) => {
    const loggedUser = req.decoded;

    if (!ValidationUtil.isValidObjectId(loggedUser.companyID) || !req.body || !ValidationUtil.isValidObjectId(req.body._id)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    const eventGroup = new EventGroup(req.body);
    eventGroup.companyID = loggedUser.companyID

    EventGroup.findOneAndUpdate({ _id: eventGroup._id, companyID: eventGroup.companyID }, eventGroup, { useFindAndModify: false, new: true, runValidators: true }).then(eventGroup => {
        if (eventGroup) {
            return res.status(HttpStatus.OK).json(eventGroup);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Event group not found'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: ValidationUtil.buildErrorMessage(err, 'update', 'eventGroup')
        });
    });
};

const remove = (req, res) => {
    const eventGroupId = req.params.id;
    const loggedUser = req.decoded;

    if (!loggedUser || !ValidationUtil.isValidObjectId(eventGroupId)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }
    // TODO: AdminAuth MW

    EventGroup.findOneAndDelete({ _id: eventGroupId, companyID: loggedUser.companyID }).then(eventGroup => {
        if (eventGroup) {
            return res.status(HttpStatus.OK).json(eventGroup);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Event group not found'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: ValidationUtil.buildErrorMessage(err, 'remove', 'eventGroup')
        });
    });
};

// ---------------------------------- HELPER FUNCTIONS ----------------------------------
// ======================================================================================

module.exports = {
    create,
    retrieveAll,
    retrieveById,
    update,
    remove
};