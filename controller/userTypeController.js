const UserType = require('../model/userTypeModel');

//Retrieve all user types
module.exports.getAll = (req, res) => {
    UserType.find({}, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.json({
                status: 'Success',
                data: data
            });
        }
    });
};