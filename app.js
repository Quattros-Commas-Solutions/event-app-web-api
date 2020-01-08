const Express  = require('express');
const BodyParser = require('body-parser');
const MongoDB = require('mongodb');
const AppConfig = require('./config').AppConfig;

//Application initialization and adding app dependencies
var application = Express();
application.use(BodyParser.json());
application.use(BodyParser.urlencoded({extended: true}));

//Starting the app on predefined port
const port = AppConfig.APPLICATION_PORT;
application.listen(port, () => {});
console.log('The app is running on port: ' + port);
