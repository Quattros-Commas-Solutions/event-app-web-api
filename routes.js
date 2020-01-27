const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const auth = require('./middleware/auth');

//Importing controllers
const eventController = require('./controller/eventController');
const userController = require('./controller/userController');
const companyController = require('./controller/companyController');
const eventQuestionController = require('./controller/eventQuestionController');
const responseTypeController = require('./controller/responseTypeController');
const eventGropController = require('./controller/eventGroupController');
const inviteController = require('./controller/inviteController');

//Setting the default route
router.get('/', auth.authUser, (req, res) => {
    res.status(HttpStatus.OK).json({
        status: 'Success',
        message: 'Event App root route is working!'
    });
});

// User routes 
// TODO: Add auth middleware when JWT is finished
router.get('/user/', auth.authAdmin, (req, res) => userController.retrieveAll(req, res));
router.post('/user/', auth.authAdmin, (req, res) => userController.create(req, res));
router.get('/user/:id', auth.authAdmin, (req, res) => userController.retrieveById(req, res));
router.patch('/user/update', auth.authUser, (req, res) => userController.update(req, res));
router.delete('/user/:id', auth.authAdmin, (req, res) => userController.remove(req, res));
router.post('/user/login', (req, res) => userController.login(req, res));
router.get('/user/token', auth.authUser, (req, res) => userController.token(req, res));

//Event routes
router.get('/event', auth.authUser, (req,res) => eventController.getAll(req, res));
router.post('/event', auth.authAdmin, (req,res) => eventController.create(req, res));
router.get('/event/:id', auth.authUser, (req,res) => eventController.getById(req, res));
router.post('/event/:id', auth.authAdmin, (req, res) => eventController.update(req, res));
router.delete('/event/:id', auth.authAdmin, (req, res) => eventController.remove(req, res));

//UserType routes
router.get('/user-type', auth.authUser, (req, res) => userTypeController.getAll(req, res));
router.get('/user-type/:id', auth.authUser, (req, res) => userTypeController.getById(req, res));

// Company routes
router.post('/company', auth.authAdmin, (req, res) => companyController.create(req, res));
router.get('/company', auth.authAdmin, (req, res) => companyController.getAll(req, res));
router.get('/company/:id', auth.authAdmin, (req, res) => companyController.getById(req, res));
router.patch('/company', auth.authAdmin, (req, res) => companyController.update(req, res));
router.delete('/company/:id', auth.authAdmin, (req, res) => companyController.deleteCompany(req, res));
router.get('/company/get-by-name/:name', auth.authAdmin, (req, res) => companyController.getByNameContains(req, res));

// EventQuestion routes 
router.post('/event-question', auth.authUser, (req, res) => eventQuestionController.create(req, res));
router.get('/event-question', auth.authUser, (req, res) => eventQuestionController.getAll(req, res));
router.get('/event-question/:id', auth.authAdmin, (req, res) => eventQuestionController.getById(req, res));
router.delete('/event-question/:id', auth.authAdmin, (req, res) => eventQuestionController.deleteById(req, res));
router.patch('/event-question', auth.authUser, (req, res) => eventQuestionController.update(req, res));
router.post('/event-question/response', auth.authUser, (req, res) => eventQuestionController.addResponseToEvent(req, res));
router.delete('/event-question/response/:eventQuestionId/:responseId', auth.authAdmin, (req, res) => eventQuestionController.deleteResponse(req, res));

// ResponseType routes
router.get('/response-type', auth.authUser, (req, res) => responseTypeController.getAll(req, res));
router.get('/response-type/:value', auth.authUser,  (req, res) => responseTypeController.getByValue(req,res));

// EventGroup routes
router.get('/event-group', auth.authUser, (req, res) => eventGropController.retrieveAll(req, res))
router.post('/event-group', auth.authAdmin, (req, res) => eventGropController.create(req, res))
router.get('/event-group/:id', auth.authUser, (req, res) => eventGropController.retrieveById(req, res))
router.patch('/event-group', auth.authAdmin, (req, res) => eventGropController.update(req, res))
router.delete('/event-group/:id', auth.authAdmin, (req, res) => eventGropController.remove(req, res))

// Invite routes
router.post('/invite', auth.authAdmin , (req, res) => inviteController.create(req, res));
router.delete('/invite/:id', auth.authAdmin, (req,res) => inviteController.remove(req,res));
router.get('/invite/:id', auth.authUser, (req, res) => inviteController.getById(req, res));
router.put('/invite/:id', auth.authUser, (req, res) => inviteController.update(req, res));

//Exporting the router
module.exports = router;