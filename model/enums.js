const UserTypeEnum = {
    'Super-Admin': 0,
    'Admin': 1,
    'Employee': 2
};

const ResponseTypeEnum = {
    'Pending': 0,
    'Accepted': 1,
    'Declined': 2
};

const StatusEnum = {
    'ERROR': 'Error',
    'SUCCESS': 'Success'
};

module.exports = {
    UserTypeEnum,
    ResponseTypeEnum,
    StatusEnum
};

// Look at how http-status-codes are implemented
// export declare const NAME = VALUE;
// Is that a better option than current enums?