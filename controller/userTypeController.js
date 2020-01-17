const UserType = require('../model/userTypeModel');
const HttpStatus = require('http-status-codes');

const ValidationUtil = require('../util/validationUtil');

//Function was done for practice but will not be exposed to api
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

//Every user can get all of the user types so no validation for user or company needed
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


//Every user can retrieve any of the user types so no user validation required
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

//Function was implemented for practice and will not be exposed to api
const remove = (req, res) => {
    const id = req.prams.id;

    UserType.findByIdAndDelete(id, { _id: 0 }).then((userType) => {
        if(userType){
            return res.status(HttpStatus.OK).json(userType);
        }else{
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'User type not found'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: 'Internal server error'
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