const HttpStatus = require("http-status-codes");

const EventGroup = require("../model/eventGroupModel");
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

    if (loggedUser.companyID != eventGroup.companyID) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            status: StatusEnum['ERROR'],
            message: 'Unauthorized'
        });
    }

    // Check if event exists 
    Event.findOne({ _id: eventGroup.eventID, companyID: eventGroup.companyID }).then(event => {
        if (!event) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Event not found'
            });
        } else {
            eventGroup.save().then(() => {
                return res.status(HttpStatus.CREATED).json(eventGroup);
            }).catch(err => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    status: StatusEnum['ERROR'],
                    message: ValidationUtil.buildErrorMessage(err, 'create', 'eventGroup')
                });
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
}

const retrieveById = (req, res) => {
    const eventGroupId = req.params.id;
    const loggedUser = req.decoded;

    if (!ValidationUtil.isValidObjectId(eventGroupId)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'Invalid ID'
        });
    }

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
};

const update = (req, res) => {
    const eventGroupId = req.params.id;
    const loggedUser = req.decoded;

    if (!ValidationUtil.isValidObjectId(eventGroupId) || !req.body) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    EventGroup.findOneAndUpdate({ _id: eventGroupId, companyID: loggedUser.companyID }, req.body, { useFindAndModify: false, new: true, runValidators: true }).then(eventGroup => {
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