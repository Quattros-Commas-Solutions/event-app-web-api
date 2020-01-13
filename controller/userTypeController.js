const UserType = require('../model/userTypeModel');
const HttpStatus = require('http-status-codes');

const ValidationUtil = require('../util/validationUtil');

const create = (req, res) => {
    const userType = new UserType(req.body);

    userType.save().then(() => {
        return res.status(HttpStatus.OK).json(userType);
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'user type');
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: errorMessage
        });
    })
};

const retrieveAll = (req, res) => {
    UserType.find({}, { _id: 0 }).then(userTypes => {
        if (userTypes) {
            const response = {
                userTypes: userTypes
            };
            return res.status(HttpStatus.OK).json(response);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'User types not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: 'Internal server error.'
        });
    });
};

const retrieveById = (req, res) => {
    const userTypeId = req.params.id;

    UserType.findById(userTypeId).then(userType => {
        if (userType) {
            return res.status(HttpStatus.OK).json(userType);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'User type not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: 'There was a problem retrieving the user type.'
        });
    });
};

const update = (req, res) => {
    UserType.findById(req.params.id).then(userType => {
        if (userType) {
            userType.value = req.body.value ? req.body.value : userType.value;
            userType.name = req.body.name ? req.body.name : userType.name;
            userType.save().then(() => {
                return res.status(HttpStatus.OK).json(userType);
            }).catch(err => {
                const errorMessage = ValidationUtil.buildErrorMessage(err, 
                                                                      'update', 
                                                                      'user type');
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: 'Error',
                    message: errorMessage
                });
            })
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'User type not found.'
            });
        }
    });
};

const remove = (req, res) => {
    UserType.remove({_id: req.params.id}).then(() => {
        return res.status(HttpStatus.OK).json({
            status: 'User type removed'
        })
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'remove', 'user type');
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: errorMessage
        });
    })
};

//Retrieve all user types
module.exports = {
    create,
    retrieveAll,
    retrieveById,
    update,
    remove
};