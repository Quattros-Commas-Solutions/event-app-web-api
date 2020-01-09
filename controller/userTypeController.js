const UserType = require('../model/userTypeModel');

//Retrieve all user types
module.exports.getAll = function(req, res){
    UserType.find({}, function (err, data){
        if(err){
            res.send(err);
        }else{
            res.json({
                status:'Success',
                data: data
            });
        }
    })
}