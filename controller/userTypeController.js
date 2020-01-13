const UserType = require('../model/userTypeModel');
const HttpStatus = require('http-status-codes');

const create = (req, res) => {
    const userType = new UserType(req.body);
}

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
    const userTypeId = req.body.id;

    UserType.findById(userTypeId).then(userType => {
        if(userType){
            return res.status(HttpStatus.OK).json(userType);
        }else{
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
}

//Retrieve all user types
module.exports = {
    retrieveAll,
    retrieveById,
};