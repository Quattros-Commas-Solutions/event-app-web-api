const Event = require('../model/eventModel');
const HttpStatus = require('http-status-codes');

const ValidationUtil = require('../util/validationUtil');

const create = (req, res) => {
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

//Events can only be retrieved for a specific company
const retrieveAll = (req, res) => {
    const companyId = req.body.companyId;

    Event.find({ companyID: companyId }).then((events) => {
        if (events) {
            const response = {
                events: events
            };

            return res.status(HttpStatus.OK).json(response);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'Events not found.'
            })
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: 'Internal server error.'
        });
    });
};

//Event can only be retrieved if the user is from the same company as the event
const retrieveById = (req, res) => {
    const eventId = req.params.id;
    const companyId = req.body.companyId;

    Event.findById(eventId).then((event) => {
        if (event) {
            const response = {
                event: event
            };

            return res.status(HttpStatus.OK).json(response);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'Event not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'Event not found'
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
};