const HttpStatus = require('http-status-codes');
const Mongoose = require('mongoose');
const ObjectId = Mongoose.Types.ObjectId;

const EventQuestion = require('../model/eventQuestionModel');
const Event = require('../model/eventModel');
const ValidationUtil = require('../util/validationUtil');
const StatusEnum = require('../model/enums').StatusEnum;

const create = (req, res) => {

    const user = req.decoded;

    if (!user || !ValidationUtil.isUserAdmin(user.accessType) || !req.body) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

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

    if (!ValidationUtil.isValidObjectId(eventQuestionId) || !user || !ValidationUtil.isValidObjectId(user.companyID)) {
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

    EventQuestion.findOne({ _id: new ObjectId(eventQuestionId), companyID: new ObjectId(user.companyID) }, { _id: 0, __v: 0 }).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Event question not found'
            });
        }
        return res.status(HttpStatus.OK).json(eventQuestion);
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

    if (!ValidationUtil.isValidObjectId(eventQuestionId) || !user || !ValidationUtil.isValidObjectId(user.companyID)) {
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

    EventQuestion.findOneAndDelete({ _id: new ObjectId(eventQuestionId), companyID: user.companyID }).then(eventQuestion => {
        if (eventQuestion) {
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

    if (!content || !ValidationUtil.isValidObjectId(eventQuestionId) || !user || !ValidationUtil.isValidObjectId(user.companyID)) {
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

    // allow commenting only on company events; TODO: additional check if user has accepted invite for event (after test data and controller for invite are made)
    EventQuestion.findOneAndUpdate({ _id: new ObjectId(eventQuestionId), companyID: user.companyID }, { $push: { responses: response } }, { useFindAndModify: false, new: true, runValidators: true }).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Event question not found'
            });
        }
        return res.status(HttpStatus.OK).json(eventQuestion.responses[eventQuestion.responses.length - 1]); // return last entry; TODO: find a better way: perhaps sort by time and take last one
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: ValidationUtil.buildErrorMessage(err, 'update', 'eventQuestion')
        });
    });

};

// only content is update-able
const update = (req, res) => {

    const eventQuestionId = req.body.id;
    const content = req.body.content;
    const user = req.decoded;

    if (!content || !ValidationUtil.isValidObjectId(eventQuestionId) || !user || !ValidationUtil.isValidObjectId(user.companyID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    EventQuestion.findOneAndUpdate({ _id: new ObjectId(eventQuestionId), companyID: new ObjectId(user.companyID) }, { content }, { useFindAndModify: false, new: true, runValidators: true }).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Event not found'
            });
        }
        return res.status(HttpStatus.OK).json(eventQuestion);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: ValidationUtil.buildErrorMessage(err, 'update', 'eventQuestion')
        });
    });

}

// only Super-Admin/Admin level users will be able to delete responses
const deleteResponse = (req, res) => {

    const responseId = req.params.responseId;
    const eventQuestionId = req.params.eventQuestionId;
    const user = req.decoded;

    if (!ValidationUtil.isValidObjectId(responseId) || !ValidationUtil.isValidObjectId(eventQuestionId) || !user || !ValidationUtil.isValidObjectId(user.companyID)) {
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

    EventQuestion.findOneAndUpdate({ _id: new ObjectId(eventQuestionId), companyID: new ObjectId(user.companyID) }, { $pull: { responses: { _id: responseId } } }, { useFindAndModify: false, new: true, runValidators: true }).then(eventQuestion => {
        if (!eventQuestion) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Not found'
            });
        }
        return res.status(HttpStatus.OK).json(eventQuestion);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: ValidationUtil.buildErrorMessage(err, 'delete', 'response')
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