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

const login = (req, res) => {
    User.findOne({
        email: req.body.email,
        active: true
    }).then(user => {
        if (user) {
            const saltedPassword = SHA256(req.body.password + user.salt).toString();
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
            user.salt = bcrypt.genSaltSync(AppConfig.SALT_ROUNDS);
            user.passwordHash = bcrypt.hashSync(user.passwordHash, user.salt);
            // Add new user
            user.save().then(() => {
                user.passwordHash = null;
                user.salt = null;
                return res.status(HttpStatus.OK).json(user);
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
    if (userId.length != 24) {
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
    if (userId.length != 24) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'Invalid ID'
        });
    }

    User.findById(userId).then(user => {
        if (user) {
            // Update fields
            user.name = req.body.name ? req.body.name : user.name;
            user.surname = req.body.surname ? req.body.surname : user.surname;
            user.email = req.body.email ? req.body.email : user.email;
            user.dateOfBirth = req.body.dateOfBirth ? req.body.dateOfBirth : user.dateOfBirth;
            user.active = req.body.active ? req.body.active : user.active;

            // Save changes
            user.save().then(() => {
                user.passwordHash = null;
                user.salt = null;
                return res.status(HttpStatus.OK).json(user);
            }).catch(err => {
                const errorMessage = ValidationUtil.buildErrorMessage(err, 'update', 'user');
                return res.status(HttpStatus.BAD_REQUEST).json({
                    status: 'Error',
                    message: errorMessage
                });
            });
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
    if (userId.length != 24) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'Invalid ID'
        });
    }

    User.deleteOne({ _id: userId }).then((retVal) => {
        if (retVal.deletedCount == 1) {
            return res.status(HttpStatus.OK).json({ status: 'User removed.' });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({ status: 'User not found.' });
        }
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'remove', 'user');
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: errorMessage
        });
    });
};


module.exports = {
    login,
    token,
    create,
    retrieveAll,
    retrieveById,
    update,
    remove
};