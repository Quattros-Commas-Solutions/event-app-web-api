const ResponseType = require('../model/responseTypeModel');
const HttpStatus = require('http-status-codes');


const getAll = (req, res) => {
    
    ResponseType.find().then( responseTypes => {       
        return res.status(HttpStatus.OK).json(responseTypes);
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    });

};

const getByValue = (req, res) => {
    const valueCode = req.params.value;

    ResponseType.findOne({value: valueCode}).then( value => {
        
        if(value) {
            return res.status(HttpStatus.OK).json(value);
        } else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Value not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: 'Internal server error'
        });
    });

}

module.exports = {
    getAll,
    getByValue
};