const router = require('express').Router();
const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const AppConfig = require('./config').AppConfig;

//Importing controllers
const userTypeController = require('./controller/userTypeController');
const userController = require('./controller/userController');
const companyController = require('./controller/companyController');

//Setting the default route
router.get('/', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).send({ auth: false, message: 'No token provided.' })
    };

    jwt.verify(token, AppConfig.SECRET, function (err, decoded) {
        if (err) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ auth: false, message: 'Failed to authenticate token.' })
        };

        res.status(HttpStatus.OK).json({
            status: 'Success',
            message: 'Event App root route is working!'
        });
    });
});

//UserType routes
router.route('/user-types').get(userTypeController.getAll);

//User routes
router.post('/user/login', (req, res) => userController.login(req, res));

// Company routes
router.post('/company', (req, res) => companyController.create(req, res));

router.get('/company/:id', (req, res) => companyController.getById(req, res));

//Exporting the router
module.exports = router;