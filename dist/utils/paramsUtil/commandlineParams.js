"use strict";
const cliOptions = require('../parsedCLIOptions');
const parsedCLIOptions = cliOptions.getCommandLineArgs();
const getAuth = () => {
    let params = {};
    params.apiKey = parsedCLIOptions['apiKey'];
    params.authorization = parsedCLIOptions['authorization'];
    params.host = parsedCLIOptions['host'];
    params.organizationId = parsedCLIOptions['organizationId'];
    return params;
};
const getScanParams = () => {
    let scanParams = {};
    scanParams.help = parsedCLIOptions['help'];
    scanParams.file = parsedCLIOptions['file'];
    scanParams.language = parsedCLIOptions['language']
        ? parsedCLIOptions['language'].toUpperCase()
        : parsedCLIOptions['language'];
    scanParams.ff = parsedCLIOptions['ff'];
    scanParams.timeout = parsedCLIOptions['timeout'];
    scanParams.name = parsedCLIOptions['name'];
    scanParams.verbose = parsedCLIOptions['verbose'];
    if (!scanParams.name) {
        scanParams.name = scanParams.file;
    }
    return scanParams;
};
module.exports = {
    getScanParams: getScanParams,
    getAuth: getAuth
};
