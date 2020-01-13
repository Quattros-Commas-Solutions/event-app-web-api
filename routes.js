const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth')
const AppConfig = require('./config').AppConfig;

//Importing controllers
const userTypeController = require('./controller/userTypeController');
const userController = require('./controller/userController');
const companyController = require('./controller/companyController');

//Setting the default route
router.get('/', auth, (req, res) => {
    res.status(HttpStatus.OK).json({
        status: 'Success',
        message: 'Event App root route is working!'
    });
    // });
});

//User routes
router.post('/user/login', (req, res) => userController.login(req, res));
router.get('/user/token', (req, res) => userController.token(req, res));

//UserType routes
router.get('/user-type', auth, (req, res) => userTypeController.retrieveAll(req, res));
router.get('/user-type/:id', auth, (req, res) => userTypeController.retrieveById(req, res));

// Company routes
router.post('/company', auth, (req, res) => companyController.create(req, res));

router.get('/company/:id', auth, (req, res) => companyController.getById(req, res));

//Exporting the router
module.exports = router;