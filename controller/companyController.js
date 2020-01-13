const HttpStatus = require('http-status-codes');

const Company = require('../model/companyModel');
const User = require('../model/userModel');
const ValidationUtil = require('../util/validationUtil');

// companies are currently created internally and manually inserted into the database
// since it is not defined who will be creating them, JWT validation is excluded at this point
const create = (req, res) => {
    const company = new Company(req.body);
    company.save().then(() => {
        res.status(HttpStatus.OK).json(company);
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'company');
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