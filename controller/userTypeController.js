const UserType = require('../model/userTypeModel');
const HttpStatus = require('http-status-codes');

const getAll = (req, res) => {
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

//Retrieve all user types
module.exports = {
    getAll: getAll
};