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

// User routes 
// TODO: Add auth middleware when JWT is finished
router.get('/user/', auth, (req, res) => userController.retrieveAll(req, res));
router.post('/user/', auth, (req, res) => userController.create(req, res));
router.get('/user/:id', auth, (req, res) => userController.retrieveById(req, res));
router.post('/user/update/:id', auth, (req, res) => userController.update(req, res));
router.delete('/user/:id', auth, (req, res) => userController.remove(req, res));
router.post('/user/login', (req, res) => userController.login(req, res));
router.get('/user/token', auth, (req, res) => userController.token(req, res));

//UserType routes
router.get('/user-types', auth, userTypeController.getAll);

// Company routes
router.post('/company', auth, (req, res) => companyController.create(req, res));

router.get('/company/:id', auth, (req, res) => companyController.getById(req, res));

//Exporting the router
module.exports = router;