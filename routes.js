const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth')
const AppConfig = require('./config').AppConfig;

//Importing controllers
const userTypeController = require('./controller/userTypeController');
const userController = require('./controller/userController');
const companyController = require('./controller/companyController');
const eventQuestionController = require('./controller/eventQuestionController');
const responseTypeController = require('./controller/responseTypeController');
const eventGropController = require('./controller/eventGroupController');

//Setting the default route
router.get('/', auth, (req, res) => {
    res.status(HttpStatus.OK).json({
        status: 'Success',
        message: 'Event App root route is working!'
    });
    // });
});

// User routes 
// TODO: Add auth middleware when JWT is finished
router.get('/user/', auth, (req, res) => userController.retrieveAll(req, res));
router.post('/user/', auth, (req, res) => userController.create(req, res));
router.get('/user/:id', auth, (req, res) => userController.retrieveById(req, res));
router.patch('/user/update', auth, (req, res) => userController.update(req, res));
router.delete('/user/:id', auth, (req, res) => userController.remove(req, res));
router.post('/user/login', (req, res) => userController.login(req, res));
router.get('/user/token', auth, (req, res) => userController.token(req, res));

//UserType routes
router.get('/user-types', auth, userTypeController.getAll);

// Company routes
router.post('/company', (req, res) => companyController.create(req, res));
router.get('/company', (req, res) => companyController.getAll(req, res));
router.get('/company/:id', auth, (req, res) => companyController.getById(req, res));
router.patch('/company', auth, (req, res) => companyController.update(req, res));
router.delete('/company/:id', (req, res) => companyController.deleteCompany(req, res));
router.get('/company/get-by-name/:name', auth, (req, res) => companyController.getByNameContains(req, res));

// EventQuestion routes 
router.post('/event-question', auth, (req, res) => eventQuestionController.create(req, res));
router.get('/event-question', auth, (req, res) => eventQuestionController.getAll(req, res));
router.get('/event-question/:id', auth, (req, res) => eventQuestionController.getById(req, res));
router.delete('/event-question/:id', auth, (req, res) => eventQuestionController.deleteById(req, res));
router.patch('/event-question', auth, (req, res) => eventQuestionController.update(req, res));
router.post('/event-question/response', auth, (req, res) => eventQuestionController.addResponseToEvent(req, res));
router.delete('/event-question/response/:eventQuestionId/:responseId', auth, (req, res) => eventQuestionController.deleteResponse(req, res));

// ResponseType routes
router.get('/response-type', auth, (req, res) => responseTypeController.getAll(req, res));
router.get('/response-type/:value', auth,  (req, res) => responseTypeController.getByValue(req,res));

// EventGroup routes
router.get('/event-group', auth, (req, res) => eventGropController.retrieveAll(req, res))
router.post('/event-group', auth, (req, res) => eventGropController.create(req, res))
router.get('/event-group/:id', auth, (req, res) => eventGropController.retrieveById(req, res))
router.patch('/event-group', auth, (req, res) => eventGropController.update(req, res))
router.delete('/event-group/:id', auth, (req, res) => eventGropController.remove(req, res))


//Exporting the router
module.exports = router;