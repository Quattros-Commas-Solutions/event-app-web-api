const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const ObjectId = require('mongoose').Types.ObjectId;

const User = require('../model/userModel');
const AppConfig = require('../config').AppConfig;
const ValidationUtil = require('../util/validationUtil');
const StatusEnum = require('../model/enums').StatusEnum;

// TODO: Discuss about the following solution for storing refresh tokens
// Followed this tutorial https://codeforgeek.com/refresh-token-jwt-nodejs-authentication/
// Discuss about JWT storage on client side. For Web apps accessToken is stored in Cookie/LocalStorage, what about Mobile apps?
const tokenList = {}


// ================================== CRUD FUNCTIONS ==================================

const login = (req, res) => {

    if (!req.body.email) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No email provided' });
    }

    User.findOne({
        email: req.body.email,
        active: true
    }).then(user => {
        if (user) {
            const saltedPassword = bcrypt.hashSync(req.body.password, user.salt);
            if (saltedPassword === user.passwordHash) {
                // Generate JWT
                const token = jwt.sign(JSON.stringify(user), AppConfig.SECRET);
                // const token = jwt.sign(JSON.stringify(user), AppConfig.SECRET, { expiresIn: AppConfig.TOKEN_LIFESPAN });
                // const refreshToken = jwt.sign(JSON.stringify(user), AppConfig.REFRESH_TOKEN_SECRET, { expiresIn: AppConfig.REFRESH_TOKEN_LIFESPAN });

                // Password & salt should be used only during login
                user.passwordHash = null;
                user.salt = null;

                return res.status(HttpStatus.OK).json({ user, token });
            } else {
                return res.status(HttpStatus.FORBIDDEN).json({
                    message: 'Incorrect email or password'
                });
            }
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Please provide a valid email and password.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    });
};

// TODO: Discuss about potential token refresh
// For mobile apps users ususally login only once so JWT shouldn't have any expiration date
// However we should be able to revoke a JWT (e.g. users phone has been stolen)
const token = (req, res) => {
    const loggedUser = req.decoded;

    // If refresh token exists
    if ((loggedUser.refreshToken) && (loggedUser.refreshToken in tokenList)) {
        User.findOne({ email: loggedUser.email, active: true }).then(user => {
            if (user) {
                // Create new token
                const token = jwt.sign(JSON.stringify(user), AppConfig.SECRET, { expiresIn: AppConfig.TOKEN_LIFESPAN });
                // Update token in the list
                tokenList[data.refreshToken].token = token;
                return res.status(HttpStatus.OK).json({ token });
            } else {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'User not found.'
                });
            }
        }).catch(err => {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error'
            });
        });
    }
};

const create = (req, res) => {
    const user = new User(req.body);
    const loggedUser = req.decoded;

    // Logged user can only create new users within his company 
    if (loggedUser.companyID != user.companyID) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Companies don\'t match'
        });
    }

    // Check if an user with the provided email exists
    User.findOne({
        email: user.email
    }).then(obj => {
        if (!obj) {
            // Generate salt & passwordHash
            let retVal = getPasswordHash(user.passwordHash);
            user.salt = retVal.salt;
            user.passwordHash = retVal.passwordHash;
            // Add new user
            user.save().then(() => {
                user.passwordHash = null;
                user.salt = null;
                return res.status(HttpStatus.CREATED).json(user);
            }).catch(err => {
                const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'user');
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: errorMessage
                });
            });
        } else {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'User with provided email already exists!'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: ValidationUtil.buildErrorMessage(err, 'create', 'user')
        });
    });
};

const getAll = (req, res) => {
    const user = req.decoded;

    User.find({
        companyID: user.companyID
    }, {
        passwordHash: 0,
        salt: 0
    }).then(users => {
        if (users) {
            return res.status(HttpStatus.OK).json(users);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Users not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    });
};

const getById = (req, res) => {
    if (!req.params.id || ValidationUtil.isValidObjectId(req.params.id)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Invalid ID'
        });
    }

    const userId = req.params.id;
    const loggedUser = req.decoded;

    User.findById(userId, { passwordHash: 0, salt: 0 }).then(user => {
        // Client can only retrieve users within his company
        if (user && user.companyID === loggedUser.companyID) {
            return res.status(HttpStatus.OK).json(user);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'User not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: ValidationUtil.buildErrorMessage(err, 'retrieveById', 'user')
        });
    });
};

const changePersonalData = (req, res) => {
    const loggedUser = req.decoded;

    let user = {};
    // Update fields
    if (req.body.name)
        user.name = req.body.name;
    if (req.body.surname)
        user.surname = req.body.surname;
    if (req.body.dateOfBirth)
        user.dateOfBirth = req.body.dateOfBirth;

    User.findOneAndUpdate({ _id: loggedUser._id }, user, { useFindAndModify: false, new: true, runValidators: true }).then(newUser => {
        if (newUser) {
            // Generate new JWT
            const token = jwt.sign(JSON.stringify(newUser), AppConfig.SECRET);
            newUser.passwordHash = null;
            newUser.salt = null;

            return res.status(HttpStatus.OK).json({ token, user: newUser });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'User not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    });
};

const changePassword = (req, res) => {
    const loggedUser = req.decoded;

    let user = {};
    if (req.body.passwordHash) {
        let retVal = getPasswordHash(req.body.passwordHash);
        user.salt = retVal.salt;
        user.passwordHash = retVal.passwordHash;
    }

    User.findOneAndUpdate({ _id: loggedUser._id }, user, { useFindAndModify: false, new: true, runValidators: true }).then(newUser => {
        if (newUser) {
            // Generate new JWT
            const token = jwt.sign(JSON.stringify(newUser), AppConfig.SECRET);
            newUser.passwordHash = null;
            newUser.salt = null;

            return res.status(HttpStatus.OK).json({ token, user: newUser });
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'User not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    });
};

const changeActiveStatus = (req, res) => {
    if (!req.params.id || !ValidationUtil.isValidObjectId(req.params.id)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid ID' });
    }

    if (!req.body.status) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No status provided' });
    }

    const userId = req.params.id;
    const status = req.body.status;
    const loggedUser = req.decoded;

    User.findOneAndUpdate({ _id: userId, companyID: loggedUser.companyID }, { active: status }, { useFindAndModify: false, new: true, runValidators: true }).then(user => {
        if (user) {
            user.passwordHash = null;
            user.salt = null;
            return res.status(HttpStatus.OK).json(user);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'User not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    });
};

const markNotificationAsRead = (req, res) => {

    const user = req.decoded;
    const notificationID = req.params.id;

    if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized access.'
        });
    }

    if (!ValidationUtil.isValidObjectId(notificationID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request. Invalid notification ID.'
        });
    }

    User.findOneAndUpdate({
        _id: user._id,
        'notifications.notificationID': new ObjectId(notificationID)
    }, {
        $set: {
            'notifications.$.read': true
        }
    }, {
        useFindAndModify: false,
        new: true,
        runValidators: true
    }).then(notificationUser => {
        if (notificationUser) {
            // if someone knows a better way to return the updated array element, hmu
            // TODO: @Dragan the token should be updated as well since the user has changed
            const notification = notificationUser.notifications.find(notification => notification.notificationID.toString() === notificationID);
            return res.status(HttpStatus.OK).json(notification);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Notification not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    });

}

const deleteNotification = (req, res) => {

    const user = req.decoded;
    const notificationID = req.params.id;

    if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized access.'
        });
    }

    if (!ValidationUtil.isValidObjectId(notificationID)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Bad request. Invalid notification ID.'
        });
    }

    User.findOneAndUpdate({
        _id: user._id, // you can only delete your own
        'notifications.notificationID': new ObjectId(notificationID)
    }, {
        $pull: {
            notifications: {
                notificationID: new ObjectId(notificationID)
            }
        }
    }, {
        useFindAndModify: false,
        new: true,
        runValidators: true
    }).then(notificationUser => {
        if (notificationUser) {
            return res.status(HttpStatus.NO_CONTENT).json(true); // since this is a delete, we agreed to return a boolean
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Notification not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error'
        });
    });

}


// ---------------------------------- HELPER FUNCTIONS ----------------------------------

function getPasswordHash(password) {
    let retVal = {};
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
    getAll,
    getById,
    changeActiveStatus,
    changePassword,
    changePersonalData,
    markNotificationAsRead,
    deleteNotification
};