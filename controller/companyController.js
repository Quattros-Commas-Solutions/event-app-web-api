const HttpStatus = require('http-status-codes');
const Mongoose = require('mongoose');

const Company = require('../model/companyModel');
const User = require('../model/userModel');
const ValidationUtil = require('../util/validationUtil');
const UserType = require('../model/userTypeModel');

// companies are currently created internally and manually inserted into the database
// since it is not defined who will be creating them, JWT validation is excluded at this point
const create = (req, res) => {
    const company = new Company(req.body);
    company.save().then(() => {
        res.status(HttpStatus.CREATED).json(company);
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
                    if (!company) {
                        return res.status(HttpStatus.NOT_FOUND).json({
                            status: 'Error',
                            message: 'Company not found'
                        });
                    }
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
        } else {
            return res.status(HttpStatus.BAD_REQUEST).json({
                status: 'Error',
                message: 'Bad request'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: 'Internal server error.'
        });
    });
};

// since we are the ones creating the companies directly
const update = (req, res) => {
    const company = req.body.company;
    const decoded = req.decoded;

    if (!company) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'Bad request'
        });
    }

    // only the admin/super-admin level users of the company can issue an update
    User.findOne({ _id: new Mongoose.Types.ObjectId(decoded.id), accessType: { $in: [0, 1] }, companyID: new Mongoose.Types.ObjectId(company.id) }).then(user => {
        if (user) {
            Company.findByIdAndUpdate(company.id, company, { useFindAndModify: false, new: true, runValidators: true }, (err, model) => {
                if (err) {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        status: 'Error',
                        message: ValidationUtil.buildErrorMessage(err, 'update', 'company')
                    });
                }
                if (!model) {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        status: 'Error',
                        message: `Company with ID '${company.id}' nor found`
                    });
                }
                return res.status(HttpStatus.OK).json(model);
            });
        } else {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                status: 'Error',
                message: 'Unauthorized access'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: 'Internal server error.'
        });
    });
};

// delete by itself is a keyword
// makes no sense for super-admin or regular admins to be able to delete a company, so authentication and other 
// validation is left out
const deleteCompany = (req, res) => {
    const companyId = req.params.id;

    Company.findByIdAndDelete(companyId, { _id: 0 }).then(company => {
        if (!company) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'Company not found'
            });
        }
        return res.status(HttpStatus.OK).json(company);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: 'Internal server error'
        });
    });
};

module.exports = {
    create,
    getById,
    update,
    deleteCompany
};