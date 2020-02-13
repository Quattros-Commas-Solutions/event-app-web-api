const UserType = require('../model/userTypeModel');
const HttpStatus = require('http-status-codes');

const ValidationUtil = require('../util/validationUtil');
const StatusEnum = require('../model/enums').StatusEnum;

//Function was done for practice but will not be exposed to api
const create = (req, res) => {
    const userType = new UserType(req.body);

    userType.save().then(() => {
        return res.status(HttpStatus.OK).json(userType);
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'user type');
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: errorMessage
        });
    })
};

//Every user can get all of the user types so no validation for user or company needed
const getAll = (req, res) => {
    const user = req.decoded;

    if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request.'
        });
    }

    UserType.find({}, { _id: 0 }).then(userTypes => {
        if (userTypes) {
            return res.status(HttpStatus.OK).json(userTypes);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'User types not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error.'
        });
    });
};


//Every user can retrieve any of the user types so no user validation required
const getById = (req, res) => {
    const userTypeId = req.params.id;
    const user = req.decoded;

    if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request.'
        });
    }

    UserType.findById(userTypeId).then(userType => {
        if (userType) {
            return res.status(HttpStatus.OK).json(userType);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'User type not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error.'
        });
    });
};

//Function was implemented for practice and it will not be exposed to the api
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
                    message: errorMessage
                });
            })
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'User type not found.'
            });
        }
    });
};

//Function was implemented for practice and will not be exposed to api
const remove = (req, res) => {
    const id = req.prams.id;

    UserType.findByIdAndDelete(id, { _id: 0 }).then((userType) => {
        if (userType) {
            return res.status(HttpStatus.OK).json(userType);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'User type not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error.'
        });
    })
};

//Retrieve all user types
module.exports = {
    create,
    getAll,
    getById,
    update,
    remove
};