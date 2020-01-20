const jwt = require('jsonwebtoken');
const AppConfig = require('../config').AppConfig;
const ValidationUtil = require('../util/validationUtil');

const HttpStatus = require('http-status-codes');

const Auth = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    // Decode token
    if (token) {
        // Remove unwanted prefix if exists
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        // Verify token
        jwt.verify(token, AppConfig.SECRET, function (err, decoded) {
            if (err) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Unauthorized access.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: 'No token provided.' });
    }
}

const AdminAuth = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    // Decode token
    if (token) {
        // Remove unwanted prefix if exists
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        // Verify token
        jwt.verify(token, AppConfig.SECRET, function (err, decoded) {
            // Only (super)admin is allowed to access this route
            if (!err && ValidationUtil.isUserAdmin(decoded.accessType)) {
                req.decoded = decoded;
                next();
            } else {
                return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Unauthorized access.' });
            }
        });
    } else {
        return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: 'No token provided.' });
    }
}

module.exports = {
    Auth,
    AdminAuth
}