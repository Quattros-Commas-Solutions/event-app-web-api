const Invite = require('../model/inviteModel');
const HttpStatus = require('http-status-codes');
const ObjectId = require('mongoose').Types.ObjectId;

const ValidationUtil = require('../util/validationUtil');
const StatusEnum = require('../model/enums').StatusEnum;

const create = (req, res) => {

    const invite = new Invite(req.body);

    invite.save().then(() => {
        return res.status(HttpStatus.CREATED).json(invite);
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'invite');
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: errorMessage
        });
    });
};

const getById = (req, res) => {

    const inviteId = req.params.id;

    Invite.findById(inviteId).then(invite => {
        if(invite) {            
            return res.status(HttpStatus.OK).json(invite);
        }
        else{ 
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Invite not found.'
            });
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error.'
        });
    })

};

const remove = (req, res) => {

    const inviteId = req.params.id;
    
    Invite.findOneAndDelete({_id: new ObjectId(inviteId)}).then(invite => {
           if(invite) {
               return res.status(HttpStatus.NO_CONTENT).json(true);
           }
           else {
               return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Invite not found.'
               })
           }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error.'
        });
    });
};

const update = (req, res) => {
    
    const inviteId = req.params.id;
    const user = req.decoded;
    
    Invite.findOne({_id: new ObjectId(inviteId)}).then(inv => {
        if(inv) {
            const newInvite = new Invite(req.body);
            
            inv.responseType = newInvite.responseType;
        
            if(user._id == inv.userID) {
               inv.save().then(() => {
                    return res.status(HttpStatus.OK).json(inv); 
               }).catch(err => {
                const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'invite');
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: errorMessage
                });
            });
            }
            
        }
        else {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: "Invite not found"
            });
        }
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'update', 'invite');
       
        return res.status(HttpStatus.BAD_REQUEST).json({            
            message: errorMessage
        });
    });;



};

module.exports = {
    create,
    getById,
    update, 
    remove
};