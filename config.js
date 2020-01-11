//Store all application config variables in this file

const AppConfig = {
    APPLICATION_PORT: process.env.PORT || 5000,
    CONNECTION_URL: 'mongodb+srv://qcsdevs:4JneurUiw1NfAjcj@clusterone-ecp1h.mongodb.net/events-app?retryWrites=true&w=majority',
    DATABASE_NAME: 'events-app',
    SECRET: 'SUPER_SECRET_SRBIJA_SRBIMA', // TODO: possibly embedded as environment variable so it's not directly visible,
    REFRESH_TOKEN_SECRET: "SUPER_SECRET_KOSOVO_I_METOHIJA",
    // 2 hours
    TOKEN_LIFESPAN: 7200,
    // 8 hours
    REFRESH_TOKEN_LIFESPAN: 28800
};

module.exports.AppConfig = AppConfig;