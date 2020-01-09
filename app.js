const Express = require('express');
const BodyParser = require('body-parser');
const Mongoose = require('mongoose');
const AppConfig = require('./config').AppConfig;
const routes = require('./routes');

//Application initialization and adding app dependencies
let application = Express();
application.use(BodyParser.json());
application.use(BodyParser.urlencoded({ extended: true }));
application.use('/api', routes);

//Starting the app on predefined port
const port = AppConfig.APPLICATION_PORT;
const connectionURL = AppConfig.CONNECTION_URL;
const databaseName = AppConfig.DATABASE_NAME;

application.listen(port, () => {
    Mongoose.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if (error) {
            //We do this to force shot down the application
            throw error;
        }
        console.log('Connection to ' + databaseName + ' successful!');
        // console.log(Mongoose.connections);
    });
});
console.log('The app is running on port: ' + port);
