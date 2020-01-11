const UserType = require('../model/userTypeModel');

const getAll = (req, res) => {
    UserType.find({}, { _id: 0 }, (err, data) => {
        if (err) {
            console.log(err)
            res.send(err);
        } else {
            res.json({
                status: 'Success',
                data: data
            });
        }
    });
};

//Retrieve all user types
module.exports = {
    getAll: getAll
};