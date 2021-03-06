const HttpStatus = require('http-status-codes');

const Company = require('../model/companyModel');
const ValidationUtil = require('../util/validationUtil');

// companies are currently created internally and manually inserted into the database
// since it is not defined who will be creating them, JWT validation is excluded at this point
const create = (req, res) => {

    const company = new Company(req.body);

    company.save().then(newCompany => {
        res.status(HttpStatus.CREATED).json(newCompany);
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'company');
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: errorMessage
        });
    });

};

// to be used by our own internal app for managing companies
// as such authentication is left out at the moment until we figure out how to do it => PERHAPS another user-type?
const getAll = (req, res) => {

    Company.find({}).then(companies => {
        return res.status(HttpStatus.OK).json(companies);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    })

};

// information about company can only be retrieved if it is an employee of the company or by our internal app
const getById = (req, res) => {

    const companyId = req.params.id;
    const user = req.decoded;

    if (!ValidationUtil.isValidObjectId(companyId) || !user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request'
        });
    }

    if (user.companyID.toString() === companyId) { // if we are to add another user-type for us, 
        // just add another check here || userType === 'Super-Super-Admin' or something similar
        Company.findById(companyId).then(company => {
            if (!company) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Company not found'
                });
            }
            return res.status(HttpStatus.OK).json(company);
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error'
            });
        });
    } else {
        return res.status(HttpStatus.NOT_FOUND).json({
            message: 'Company not found'
        });
    }

};

const update = (req, res) => {

    const company = req.body.company;
    const user = req.decoded;

    if (!company || !user || !ValidationUtil.isValidObjectId(company.id)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request'
        });
    }

    if (user.companyID.toString() === company.id) {
        Company.findByIdAndUpdate(company.id, company, { useFindAndModify: false, new: true, runValidators: true }).then(model => {
            if (!model) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: `Company with ID '${company.id}' not found`
                });
            }
            return res.status(HttpStatus.OK).json(model);
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: ValidationUtil.buildErrorMessage(err, 'update', 'company')
            });
        });
    } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({
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
            message: 'Bad request'
        });
    }

    Company.findByIdAndDelete(companyId).then(company => {
        if (!company) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Company not found'
            });
        }
        return res.status(HttpStatus.OK).json(true);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    });

};

// to be used by our internal app for managing companies and super-admins
// authorization to be done by special user-type and auth middleware layer perhaps?
const getByNameContains = (req, res) => {

    const companyName = req.params.name;

    if (!companyName) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request'
        });
    }

    // case insensitive search
    Company.find({ name: { $regex: `.*${companyName}.*`, '$options': 'i' } }).then(companies => {
        return res.status(HttpStatus.OK).json(companies);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    })

};

module.exports = {
    create,
    getById,
    getAll,
    update,
    deleteCompany,
    getByNameContains
};