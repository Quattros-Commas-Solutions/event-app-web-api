const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth').auth;

//Importing controllers
const userTypeController = require('./controller/userTypeController');
const userController = require('./controller/userController');
const companyController = require('./controller/companyController');
const eventQuestionController = require('./controller/eventQuestionController');
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
router.get('/user/', auth(true), (req, res) => userController.retrieveAll(req, res));
router.post('/user/', auth(true), (req, res) => userController.create(req, res));
router.get('/user/:id', auth(true), (req, res) => userController.retrieveById(req, res));
router.patch('/user/update', auth, (req, res) => userController.update(req, res));
router.delete('/user/:id', auth(true), (req, res) => userController.remove(req, res));
router.post('/user/login', (req, res) => userController.login(req, res));
router.get('/user/token', auth, (req, res) => userController.token(req, res));

//UserType routes
router.get('/user-types', auth(true), userTypeController.getAll);

// Company routes
router.post('/company', auth(true), (req, res) => companyController.create(req, res));
router.get('/company', auth(true), (req, res) => companyController.getAll(req, res));
router.get('/company/:id', auth(true), (req, res) => companyController.getById(req, res));
router.patch('/company', auth(true), (req, res) => companyController.update(req, res));
router.delete('/company/:id', auth(true), (req, res) => companyController.deleteCompany(req, res));
router.get('/company/get-by-name/:name', auth(true), (req, res) => companyController.getByNameContains(req, res));

// EventQuestion routes 
router.post('/event-question', auth, (req, res) => eventQuestionController.create(req, res));
router.get('/event-question', auth, (req, res) => eventQuestionController.getAll(req, res));
router.get('/event-question/:id', auth(true), (req, res) => eventQuestionController.getById(req, res));
router.delete('/event-question/:id', auth(true), (req, res) => eventQuestionController.deleteById(req, res));
router.patch('/event-question', auth, (req, res) => eventQuestionController.update(req, res));
router.post('/event-question/response', auth, (req, res) => eventQuestionController.addResponseToEvent(req, res));
router.delete('/event-question/response/:eventQuestionId/:responseId', auth(true), (req, res) => eventQuestionController.deleteResponse(req, res));

// EventGroup routes
router.get('/event-group', auth, (req, res) => eventGropController.retrieveAll(req, res))
router.post('/event-group', auth(true), (req, res) => eventGropController.create(req, res))
router.get('/event-group/:id', auth, (req, res) => eventGropController.retrieveById(req, res))
router.patch('/event-group', auth(true), (req, res) => eventGropController.update(req, res))
router.delete('/event-group/:id', auth(true), (req, res) => eventGropController.remove(req, res))


//Exporting the router
module.exports = router;