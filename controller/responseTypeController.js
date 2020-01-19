const ResponseType = require('../model/responseTypeModel');
const HttpStatus = require('http-status-codes');


exports.getAll = function(req, res) {
    
    ResponseType.find().then( responseTypes => {
        if(responseTypes) {
            return res.status(HttpStatus.OK).json(responseTypes);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'Not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    });

};

exports.getByValue = function(req, res) {
    const valueCode = req.params.id;

    ResponseType.find({value: valueCode}).then( value => {
        
        if(value) {
            return res.status(HttpStatus.OK).json(value);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Error',
                message: 'Value not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    });

}