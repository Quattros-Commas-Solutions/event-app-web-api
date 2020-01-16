const SHA256 = require('crypto-js/sha256');
const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const bcrypt = require('bcryptjs');
const User = require('../model/userModel');
const AppConfig = require('../config').AppConfig;
const ValidationUtil = require('../util/validationUtil');

// TODO: Discuss about the following solution for storing refresh tokens
// Followed this tutorial https://codeforgeek.com/refresh-token-jwt-nodejs-authentication/
// Discuss about JWT storage on client side. For Web apps accessToken is stored in Cookie/LocalStorage, what about Mobile apps?
const tokenList = {}


// ================================== CRUD FUNCTIONS ==================================

const login = (req, res) => {
    User.findOne({
        email: req.body.email,
        active: true
    }).then(user => {
        console.log(user);
        if (user) {
            const saltedPassword = bcrypt.hashSync(req.body.password, user.salt);
            if (saltedPassword === user.passwordHash) {
                // Generate JWT
                const token = jwt.sign({ id: user._id }, AppConfig.SECRET);
                // const token = jwt.sign({ id: user._id }, AppConfig.SECRET, { expiresIn: AppConfig.TOKEN_LIFESPAN });
                // const refreshToken = jwt.sign({ id: user._id }, AppConfig.REFRESH_TOKEN_SECRET, { expiresIn: AppConfig.REFRESH_TOKEN_LIFESPAN });

                // Password & salt should be used only during login
                user.passwordHash = null;
                user.salt = null;

                // Generate response
                const response = {
                    auth: true,
                    status: 'Logged in',
                    user: user,
                    token: token
                };

                return res.status(HttpStatus.OK).json(response);
            } else {
                return res.status(HttpStatus.FORBIDDEN).json({
                    status: 'Error',
                    message: 'Incorrect email or password'
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'Please provide a valid email and password.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: 'Internal server error.'
        });
    });
};

// TODO: Discuss about potential token refresh
// For mobile apps users ususally login only once so JWT shouldn't have any expiration date
// However we should be able to revoke a JWT (e.g. users phone has been stolen)
const token = (req, res) => {
    const data = req.body;
    // If refresh token exists
    if ((data.refreshToken) && (data.refreshToken in tokenList)) {
        const user = { email: data.email, active: true }
        User.findOne(user).then(user => {
            if (user) {
                // Create new token
                const token = jwt.sign({ id: user._id }, AppConfig.SECRET, { expiresIn: AppConfig.TOKEN_LIFESPAN });
                const response = { token: token };
                // Update token in the list
                tokenList[data.refreshToken].token = token;
                return res.status(HttpStatus.OK).json(response);
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    status: 'Error',
                    message: 'User not found.'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: 'Error',
                message: 'Internal server error.'
            });
        });
    }
}

const create = (req, res) => {
    const user = new User(req.body);

    // Check if an user with the provided email exists
    User.find({ email: user.email }).then(users => {
        if (users.length == 0) {
            // Generate salt & passwordHash
            let retVal = getPasswordHash(user.passwordHash);
            user.salt = retVal.salt;
            user.passwordHash = retVal.passwordHash;
            // Add new user
            user.save().then(() => {
                user.passwordHash = null;
                user.salt = null;
                return res.status(HttpStatus.CREATED).json(user);
            });
        } else {
            return res.status(HttpStatus.BAD_REQUEST).json({
                status: 'Error',
                message: 'User with provided email already exists!'
            });
        }
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'user');
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: errorMessage
        });
    });
};

const retrieveAll = (req, res) => {
    User.find({}, { passwordHash: 0, salt: 0 }).then(users => {
        if (users) {
            return res.status(HttpStatus.OK).json(users);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'Users not found.'
            });
        }
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'retrieveAll', 'user');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: errorMessage
        });
    });
};

const retrieveById = (req, res) => {
    const userId = req.params.id;
    if (userId.length != AppConfig.OBJECT_ID_LEN) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'Invalid ID'
        });
    }

    User.findById(userId, { passwordHash: 0, salt: 0 }).then(user => {
        if (user) {
            return res.status(HttpStatus.OK).json(user);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'User not found.'
            });
        }
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'retrieveById', 'user');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: errorMessage
        });
    });
};

const update = (req, res) => {
    const userId = req.params.id;
    if (userId.length != AppConfig.OBJECT_ID_LEN) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'Invalid ID'
        });
    }
    user = {};
    // Update fields
    if (req.body.name)
        user.name = req.body.name;
    if (req.body.surname)
        user.surname = req.body.surname;
    if (req.body.email)
        user.email = req.body.email;
    if (req.body.dateOfBirth)
        user.dateOfBirth = req.body.dateOfBirth;
    if (req.body.active)
        user.active = req.body.active;
    if (req.body.passwordHash) {
        let retVal = getPasswordHash(req.body.passwordHash);
        user.salt = retVal.salt;
        user.passwordHash = retVal.passwordHash;
    }

    User.findOneAndUpdate({ _id: userId }, user).then(newUser => {
        if (newUser) {
            newUser.passwordHash = null;
            newUser.salt = null;
            return res.status(HttpStatus.OK).json(newUser);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'User not found.'
            });
        }
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'update', 'user');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: errorMessage
        });
    });
};

const remove = (req, res) => {
    const userId = req.params.id;
    if (userId.length != AppConfig.OBJECT_ID_LEN) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'Invalid ID'
        });
    }

    User.findOneAndUpdate({ _id: userId }, { active: 0 }).then(user => {
        if (user) {
            user.passwordHash = null;
            user.salt = null;
            return res.status(HttpStatus.OK).json(user);
        }
        else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'User not found.'
            });
        }
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'update', 'user');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: errorMessage
        });
    });
};

// ---------------------------------- HELPER FUNCTIONS ----------------------------------

function getPasswordHash(password) {
    retVal = {};
    // Generate salt & passwordHash
    retVal.salt = bcrypt.genSaltSync(AppConfig.SALT_ROUNDS);
    retVal.passwordHash = bcrypt.hashSync(password, retVal.salt);
    return retVal;
}

// ======================================================================================




module.exports = {
    login,
    token,
    create,
    retrieveAll,
    retrieveById,
    update,
    remove
};