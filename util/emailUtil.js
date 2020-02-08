const nodemailer = require('nodemailer');
const chalk = require('chalk');

const AppConfig = require('../config').AppConfig;

let transporter = undefined;

/**
 * Sets up transporter for inital use
 */
const setup = () => {

    transporter = nodemailer.createTransport({
        host: 'smtp.google.com', // could be moved to config.js
        auth: {
            user: AppConfig.EMAIL,
            pass: AppConfig.EMAIL_PASSWORD
        }
    });

    transporter.verify().then(success => {
        console.log(success);
        return transporter;
    }).catch(err => {
        console.log('errrr')
        console.error(err);
        return undefined;
    });

};

// CC recipients are ones included in the email, but not intended directly for them 
// in this case this will be the (super)admins of the company
/**
 * 
 * @param {string} subject 
 * @param {string} content 
 * @param {list<string>} recipients 
 * @param {list<string>} ccRecipients 
 */
const sendEmail = (subject, content, recipients, ccRecipients) => {

    if (!transporter) {
        transporter = setup();
    }

    if (!transporter) {
        console.log('Unable to send email');
        return false;
    }

    const message = {
        from: AppConfig.EMAIL,
        to: recipients,
        cc: ccRecipients,
        subject,
        text: content
    };

    transporter.sendMail(message).then(retVal => {
        console.log(retVal);
        return true;
    }).catch(err => {
        console.log(err);
        return false;
    });

};

module.exports = {
    sendEmail
};