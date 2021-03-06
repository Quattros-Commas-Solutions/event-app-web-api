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

//Setting the default route
router.get('/', auth.authUser, (req, res) => {
    res.status(HttpStatus.OK).json({
        status: 'Success',
        message: 'Event App root route is working!'
    });
});

// User routes 
router.get('/user/', auth.authAdmin, (req, res) => userController.getAll(req, res));
router.post('/user/', auth.authAdmin, (req, res) => userController.create(req, res));
router.get('/user/:id', auth.authAdmin, (req, res) => userController.getById(req, res));
router.patch('/user/', auth.authUser, (req, res) => userController.changePersonalData(req, res));
router.patch('/user/changePassword', auth.authUser, (req, res) => userController.changePassword(req, res));
router.patch('/user/:id', auth.authAdmin, (req, res) => userController.changeActiveStatus(req, res));
router.post('/user/login', (req, res) => userController.login(req, res));
router.get('/user/token', auth.authUser, (req, res) => userController.token(req, res));

//Event routes
router.get('/event', auth.authUser, (req, res) => eventController.getAll(req, res));
router.post('/event', auth.authAdmin, (req, res) => eventController.create(req, res));
router.get('/event/:id', auth.authUser, (req, res) => eventController.getById(req, res));
router.post('/event/:id', auth.authAdmin, (req, res) => eventController.update(req, res));
router.delete('/event/:id', auth.authAdmin, (req, res) => eventController.remove(req, res));

//UserType routes
router.get('/user-type', auth.authUser, (req, res) => userTypeController.getAll(req, res));
router.get('/user-type/:id', auth.authUser, (req, res) => userTypeController.getById(req, res));

// Company routes
router.post('/company', (req, res) => companyController.create(req, res));
router.get('/company', (req, res) => companyController.getAll(req, res));
router.get('/company/:id', auth.authUser, (req, res) => companyController.getById(req, res));
router.patch('/company', auth.authAdmin, (req, res) => companyController.update(req, res));
router.delete('/company/:id', (req, res) => companyController.deleteCompany(req, res));
router.get('/company/get-by-name/:name', (req, res) => companyController.getByNameContains(req, res));

// EventQuestion routes 
router.post('/event-question', auth.authUser, (req, res) => eventQuestionController.create(req, res));
// this is kinda dumb, but the way it was set up before you were getting every event question for every event 
// in the company, it is only natural that you would get only the ones for a specific event
router.get('/event-question/all/:event_id', auth.authUser, (req, res) => eventQuestionController.getAll(req, res));
router.get('/event-question', auth.authUser, (req, res) => eventQuestionController.getAll(req, res));
router.get('/event-question/unanswered', auth.authAdmin, (req, res) => eventQuestionController.getAllUnanswered(req, res));
router.get('/event-question/unanswered/:event_id', auth.authAdmin, (req, res) => eventQuestionController.getAllUnansweredForEvent(req, res));
router.get('/event-question/:id', auth.authAdmin, (req, res) => eventQuestionController.getById(req, res));
router.delete('/event-question/:id', auth.authAdmin, (req, res) => eventQuestionController.deleteById(req, res));
router.patch('/event-question', auth.authUser, (req, res) => eventQuestionController.update(req, res));
router.post('/event-question/response', auth.authUser, (req, res) => eventQuestionController.addResponseToEvent(req, res));
router.delete('/event-question/response/:eventQuestionID/:responseID', auth.authAdmin, (req, res) => eventQuestionController.deleteResponse(req, res));

// ResponseType routes
router.get('/response-type', auth.authUser, (req, res) => responseTypeController.getAll(req, res));
router.get('/response-type/:value', auth.authUser, (req, res) => responseTypeController.getByValue(req, res));

// EventGroup routes
router.get('/event-group', auth.authUser, (req, res) => eventGropController.retrieveAll(req, res));
router.post('/event-group', auth.authAdmin, (req, res) => eventGropController.create(req, res));
router.get('/event-group/:id', auth.authUser, (req, res) => eventGropController.retrieveById(req, res));
router.patch('/event-group', auth.authAdmin, (req, res) => eventGropController.update(req, res));
router.delete('/event-group/:id', auth.authAdmin, (req, res) => eventGropController.remove(req, res));


//Exporting the router
module.exports = router;