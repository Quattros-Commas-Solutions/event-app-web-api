//Store all application config variables in this file

const AppConfig = {
    APPLICATION_PORT: process.env.PORT || 5000,
    CONNECTION_URL: 'mongodb+srv://qcsdevs:4JneurUiw1NfAjcj@clusterone-ecp1h.mongodb.net/events-app?retryWrites=true&w=majority',
    DATABASE_NAME: 'events-app',
    SECRET: 'SUPER_secret' // TODO: possibly embedded as environment variable so it's not directly visible
};

module.exports.AppConfig = AppConfig;