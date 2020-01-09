const Express  = require('express');
const BodyParser = require('body-parser');
const Mongoose = require('mongoose');
const AppConfig = require('./config').AppConfig;

//Application initialization and adding app dependencies
var application = Express();
application.use(BodyParser.json());
application.use(BodyParser.urlencoded({extended: true}));

//Starting the app on predefined port
const port = AppConfig.APPLICATION_PORT;
const connectionURL = AppConfig.CONNECTION_URL;
const databaseName = AppConfig.DATABASE_NAME;

application.listen(port, () => {
    Mongoose.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {
        if(error){
            //We do this to force shot down the application
            throw error;
        }
        console.log('Connection to ' + databaseName + ' successful!');
    });
});
console.log('The app is running on port: ' + port);
