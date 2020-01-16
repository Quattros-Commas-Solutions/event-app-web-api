const HttpStatus = require('http-status-codes');
const Mongoose = require('mongoose');

const Company = require('../model/companyModel');
const ValidationUtil = require('../util/validationUtil');
const UserTypeEnum = require('../model/enums').UserTypeEnum;
const StatusEnum = require('../model/enums').StatusEnum;
const AppConfig = require('../config').AppConfig;

// companies are currently created internally and manually inserted into the database
// since it is not defined who will be creating them, JWT validation is excluded at this point
const create = (req, res) => {

    const company = new Company(req.body);

    company.save().then(() => {
        res.status(HttpStatus.CREATED).json(company);
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'company');
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: errorMessage
        });
    });

};

// information about company can only be retrieved if it is an employee of the company
const getById = (req, res) => {

    const companyId = req.params.id;
    const user = req.decoded;

    if (!ValidationUtil.isValidObjectId(companyId) || !user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    // we only need the companyID
    if (user.companyID.toString() === companyId) {
        Company.findById(companyId, { _id: 0 }).then(company => {
            if (!company) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: StatusEnum['ERROR'],
                    message: 'Company not found'
                });
            }
            return res.status(HttpStatus.OK).json(company);
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: StatusEnum['ERROR'],
                message: 'Internal server error'
            });
        });
    } else {
        return res.status(HttpStatus.NOT_FOUND).json({
            status: StatusEnum['ERROR'],
            message: 'Company not found'
        });
    }

};

// since we are the ones creating the companies directly
const update = (req, res) => {

    const company = req.body.company;
    const user = req.decoded;

    if (!company || !user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    // only the admin/super-admin level users of the company can issue an update
    if (ValidationUtil.isUserAdmin(user.accessType) && user.companyID.toString() === company.id) {
        Company.findByIdAndUpdate(company.id, company, { useFindAndModify: false, new: true, runValidators: true }).then(model => {
            if (!model) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: StatusEnum['ERROR'],
                    message: `Company with ID '${company.id}' nor found`
                });
            }
            return res.status(HttpStatus.OK).json(model);
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: StatusEnum['ERROR'],
                message: ValidationUtil.buildErrorMessage(err, 'update', 'company')
            });
        });
    } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            status: StatusEnum['ERROR'],
            message: 'Unauthorized access'
        });
    }

};

// delete by itself is a keyword
// makes no sense for super-admin or regular admins to be able to delete a company, so authentication and other 
// validation is left out until we figure out how to do it
const deleteCompany = (req, res) => {

    const companyId = req.params.id;

    if (!ValidationUtil.isValidObjectId(companyId)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    Company.findByIdAndDelete(companyId, { _id: 0 }).then(company => {
        if (!company) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Company not found'
            });
        }
        return res.status(HttpStatus.OK).json(company);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: 'Internal server error'
        });
    });
};

const getByNameContains = (req, res) => {
    const companyName = req.params.name;
    const user = req.decoded;

    if (!companyName || !user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
            message: 'Bad request'
        });
    }

    // since a user can be only part of one company, only one is being sent back
    Company.findOne({ name: { $regex: `.*${companyName}.*` }, _id: new Mongoose.Types.ObjectId(user.companyID) }, { _id: 0 }).then(company => {
        if (company) {
            return res.status(HttpStatus.OK).json(company);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Company not found'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: 'Internal server error'
        });
    })

};

module.exports = {
    create,
    getById,
    update,
    deleteCompany,
    getByNameContains
};