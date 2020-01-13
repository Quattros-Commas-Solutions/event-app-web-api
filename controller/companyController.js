const HttpStatus = require('http-status-codes');
const os = require('os');
const jwt = require('jsonwebtoken');

const Company = require('../model/companyModel');
const User = require('../model/userModel');

// companies are currently created internally and manually inserted into the database
// since it is not defined who will be creating them, JWT validation is excluded at this point
const create = (req, res) => {
    const company = new Company(req.body);
    company.save().then(() => {
        res.status(HttpStatus.OK).json(company);
    }).catch(err => {
        // TODO: extract to Utils class for getting general validation errors from models
        const keys = Object.keys(err.errors);
        let errorMessage = `Unable to create company. Please reffer to reasons below as to why. ${os.EOL}`;
        keys.forEach(key => {
            errorMessage += `\t${err.errors[key].message} ${os.EOL}`;
        });
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: errorMessage
        });
    });
};

// information about company can only be retrieved if it is an employee of the company
const getById = (req, res) => {
    const companyId = req.params.id;
    const decoded = req.decoded;

    // we only need the companyID
    User.findById(decoded.id, { companyID: 1 }).then(user => {
        if (user) {
            if (user.companyID.toString() === companyId) {
                Company.findById(companyId, { _id: 0 }).then(company => {
                    return res.status(HttpStatus.OK).json(company);
                }).catch(err => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        status: 'Error',
                        message: 'Internal server error'
                    });
                });
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: 'Error',
                    message: 'Company not found'
                });
            }
        }
    });
};

module.exports = {
    create: create,
    getById: getById
};