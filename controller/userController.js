const SHA256 = require('crypto-js/sha256');
const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const User = require('../model/userModel');
const AppConfig = require('../config').AppConfig;

const login = (req, res) => {
    User.findOne({
        email: req.body.email,
        active: true
    }).then(user => {
        if (user) {
            const saltedPassword = SHA256(req.body.password + user.salt).toString();
            if (saltedPassword === user.passwordHash) {
                const token = jwt.sign({ id: user._id }, AppConfig.SECRET, {
                    expiresIn: 7200 // expires in 2 hours
                });
                return res.status(HttpStatus.OK).json({ auth: true, user, token });
            };
        }
        return res.status(HttpStatus.NOT_FOUND).json({
            status: 'Error',
            message: 'Please provide a valid username and password.'
        });
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'Error',
            message: 'Internal server error.'
        });
    });
};

module.exports = {
    login: login
};