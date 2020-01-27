const Invite = require('../model/inviteModel');
const HttpStatus = require('http-status-codes');
const ObjectId = require('mongoose').Types.ObjectId;

const ValidationUtil = require('../util/validationUtil');
const StatusEnum = require('../model/enums').StatusEnum;

const create = (req, res) => {

    const user = req.decoded;

    //Only admins can create invite objects
    if (!user || !ValidationUtil.isUserAdmin(user.accessType)) {
        return res.status(HttpStatus.FORBIDDEN).json({
            status: StatusEnum['ERROR'],
            message: 'Forbidden.'
        })
    }

    const invite = new Invite(req.body);

    invite.save().then(() => {
        return res.status(HttpStatus.CREATED).json(invite);
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'create', 'invite');
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: errorMessage
        });
    });
};

const getById = (req, res) => {

    const inviteId = req.params.id;
    const user = req.decoded;

    Invite.findById(inviteId).then(invite => {
        if(invite) {            
            return res.status(HttpStatus.OK).json(invite);
        }
        else{ 
            return res.status(HttpStatus.NOT_FOUND).json();
        }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: 'Internal server error.'
        });
    })

};

const remove = (req, res) => {
    
    const user = req.decoded;

    //Only admins can remove invite objects
    if (!user || !ValidationUtil.isUserAdmin(user.accessType)) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            status: StatusEnum['ERROR'],
            message: 'Forbidden.'
        })
    }
   
    const inviteId = req.params.id;
    
    Invite.findOneAndDelete({_id: new ObjectId(inviteId)}).then(invite => {
           if(invite) {
               return res.status(HttpStatus.OK).json(true);
           }
           else {
               return res.status(HttpStatus.NOT_FOUND).json();
           }
    }).catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: StatusEnum['ERROR'],
            message: 'Internal server error.'
        });
    });
};

const update = (req, res) => {
    
    const inviteId = req.params.id;
    const user = req.decoded;
    
    Invite.findOneAndUpdate({_id: new ObjectId(inviteId)}, req.body, {runValidators: true, new: true}).then(inv => {
        if(inv) {
               
            // only admins and user who recieved invite can update invite
            if(user && (user._id === inv.userID || ValidationUtil.isUserAdmin(user.accessType))) {
                return res.status(HttpStatus.OK).json(inv);
            } else {
               return res.status(HttpStatus.FORBIDDEN).json();
            }

        }
        else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: StatusEnum['ERROR'],
                message: 'Invite not found.'
            });
        }
    }).catch(err => {
        const errorMessage = ValidationUtil.buildErrorMessage(err, 'update', 'invite');
        console.log(err);
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: StatusEnum['ERROR'],
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