const UserType = require('../model/userTypeModel');
const HttpStatus = require('http-status-codes');

const create = (req, res) => {
    const userType = new UserType(req.body);

    userType.save().then(() => {
        return res.status(HttpStatus.OK).json(userType);
    }).catch(err => {
        //TODO: add error message building when the module is added to master
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'User type could not be created.'
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
                //TODO: add error message builder when the feature is done
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: 'Error',
                    message: 'User type could not be updated.'
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
        //TODO: update to use error builder when the module is ready
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'User type could not be removed.'
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