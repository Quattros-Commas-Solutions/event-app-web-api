//Store all application config variables in this file

const AppConfig = {
    APPLICATION_PORT: process.env.PORT || 5000,
    CONNECTION_URL: 'mongodb+srv://qcsdevs:4JneurUiw1NfAjcj@clusterone-ecp1h.mongodb.net/events-app?retryWrites=true&w=majority',
    DATABASE_NAME: 'events-app',
    SALT_ROUNDS: 10,
    SECRET: 'SUPER_SECRET_SRBIJA_SRBIMA',
    REFRESH_TOKEN_SECRET: 'SUPER_SECRET_KOSOVO_I_METOHIJA',
    TOKEN_LIFESPAN: 7200, // 2 hours
    REFRESH_TOKEN_LIFESPAN: 28800, // 8 hours
    OBJECT_ID_LEN: 24, 
    EMAIL: 'mdpetf@gmail.com', 
    EMAIL_PASSWORD: 'SECUREETF123'
};

module.exports.AppConfig = AppConfig;