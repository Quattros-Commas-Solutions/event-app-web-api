const router = require('express').Router();

//Importing controllers
const userTypeController = require('./controller/userTypeController');

//Setting the default route
router.get('/', (req, res) => {
    return res.json({
        status: 'Success',
        message: 'Event App root route is working!'
    })
});

//UserType routes
router.route('/user-types',)
    .get(userTypeController.getAll);


//Exporting the router
module.exports = router;