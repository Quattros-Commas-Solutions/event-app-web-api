const jwt = require('jsonwebtoken');
const AppConfig = require('../config').AppConfig;
const ValidationUtil = require('../util/validationUtil');

const HttpStatus = require('http-status-codes');

const authUser = (req, res, next) => {
    return authHelper(req, res, next);
};

const authAdmin = (req, res, next) => {
    return authHelper(req, res, next, ValidationUtil.isUserAdmin);
};

const authHelper = (req, res, next, checkAuthorizationCallback) => {

    const token = req.headers['x-access-token'] || req.headers['authorization'];

    // Decode token
    if (token) {
        // Remove unwanted prefix if exists
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        // Verify token
        jwt.verify(token, AppConfig.SECRET, function (err, decoded) {
            if (!err) {
                // If checkAccessType is true => (super)admin-specific route
                if (checkAuthorizationCallback && checkAuthorizationCallback(decoded.accessType)) {
                    req.decoded = decoded;
                    next();
                }
                // If checkAccessType is false => available for all logged users
                else if (!checkAuthorizationCallback) {
                    req.decoded = decoded;
                    next();
                } else {
                    // Logged user can't access (super)admin-specific routes
                    return res.status(HttpStatus.UNAUTHORIZED).json({
                        success: false,
                        message: 'Unauthorized access.'
                    });
                }
            } else {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    error: true,
                    success: false,
                    message: 'Unauthorized access.'
                });
            }
        });
    } else {
        res.status(HttpStatus.FORBIDDEN).json({
            error: true,
            success: false,
            message: 'No token provided.'
        });
    }

}


module.exports = {
    authUser,
    authAdmin
};