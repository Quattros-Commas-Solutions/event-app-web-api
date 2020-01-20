const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const Auth = require('./middleware/auth').Auth;
const AdminAuth = require('./middleware/auth').AdminAuth;
const AppConfig = require('./config').AppConfig;

//Importing controllers
const userTypeController = require('./controller/userTypeController');
const userController = require('./controller/userController');
const companyController = require('./controller/companyController');
const eventQuestionController = require('./controller/eventQuestionController');
const eventGropController = require('./controller/eventGroupController');

//Setting the default route
router.get('/', Auth, (req, res) => {
    res.status(HttpStatus.OK).json({
        status: 'Success',
        message: 'Event App root route is working!'
    });
    // });
});

// User routes 
// TODO: Add auth middleware when JWT is finished
router.get('/user/', AdminAuth, (req, res) => userController.retrieveAll(req, res));
router.post('/user/', AdminAuth, (req, res) => userController.create(req, res));
router.get('/user/:id', AdminAuth, (req, res) => userController.retrieveById(req, res));
router.patch('/user/update', Auth, (req, res) => userController.update(req, res));
router.delete('/user/:id', AdminAuth, (req, res) => userController.remove(req, res));
router.post('/user/login', (req, res) => userController.login(req, res));
router.get('/user/token', Auth, (req, res) => userController.token(req, res));

//UserType routes
router.get('/user-types', AdminAuth, userTypeController.getAll);

// Company routes
router.post('/company', AdminAuth, (req, res) => companyController.create(req, res));
router.get('/company', AdminAuth, (req, res) => companyController.getAll(req, res));
router.get('/company/:id', AdminAuth, (req, res) => companyController.getById(req, res));
router.patch('/company', AdminAuth, (req, res) => companyController.update(req, res));
router.delete('/company/:id', AdminAuth, (req, res) => companyController.deleteCompany(req, res));
router.get('/company/get-by-name/:name', AdminAuth, (req, res) => companyController.getByNameContains(req, res));

// EventQuestion routes 
router.post('/event-question', Auth, (req, res) => eventQuestionController.create(req, res));
router.get('/event-question', Auth, (req, res) => eventQuestionController.getAll(req, res));
router.get('/event-question/:id', AdminAuth, (req, res) => eventQuestionController.getById(req, res));
router.delete('/event-question/:id', AdminAuth, (req, res) => eventQuestionController.deleteById(req, res));
router.patch('/event-question', Auth, (req, res) => eventQuestionController.update(req, res));
router.post('/event-question/response', Auth, (req, res) => eventQuestionController.addResponseToEvent(req, res));
router.delete('/event-question/response/:eventQuestionId/:responseId', AdminAuth, (req, res) => eventQuestionController.deleteResponse(req, res));

// EventGroup routes
router.get('/event-group', Auth, (req, res) => eventGropController.retrieveAll(req, res))
router.post('/event-group', AdminAuth, (req, res) => eventGropController.create(req, res))
router.get('/event-group/:id', Auth, (req, res) => eventGropController.retrieveById(req, res))
router.patch('/event-group', AdminAuth, (req, res) => eventGropController.update(req, res))
router.delete('/event-group/:id', AdminAuth, (req, res) => eventGropController.remove(req, res))


//Exporting the router
module.exports = router;