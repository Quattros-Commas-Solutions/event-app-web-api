const nodemailer = require('nodemailer');

const AppConfig = require('../config').AppConfig;

// CC recipients are ones included in the email, but not intended directly for them 
// in this case this will be the (super)admins of the company
/**
 * 
 * @param {string} subject 
 * @param {string} content 
 * @param {string[]} recipients 
 * @param {string[]} ccRecipients 
 */
const sendEmail = (subject, content, recipients, ccRecipients) => {

    if (!recipients || !subject || !content) {
        return false;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',  // could be moved to config.js
        secure: true,
        port: 587,
        auth: {
            user: AppConfig.EMAIL,
            pass: AppConfig.EMAIL_PASSWORD
        }
    });

    transporter.verify().then(success => {

        const message = {
            from: AppConfig.EMAIL,
            to: recipients,
            cc: ccRecipients || [],
            subject,
            text: content
        };

        transporter.sendMail(message).then(response => {
            return true;
        }).catch(err => {
            return false;
        });
    }).catch(err => {
        return false;
    });

};

module.exports = {
    sendEmail
};