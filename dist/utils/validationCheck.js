"use strict";
const checkConfigHasRequiredValues = store => {
    return (store.has('apiKey') &&
        store.has('organizationId') &&
        store.has('host') &&
        store.has('authorization') &&
        store.has('version'));
};
const validateRequiredScanParams = params => {
    return (params.apiKey &&
        params.organizationId &&
        params.host &&
        params.authorization &&
        params.version);
};
const validateAuthParams = params => {
    return !!(params.apiKey &&
        params.organizationId &&
        params.host &&
        params.authorization);
};
module.exports = {
    checkConfigHasRequiredValues: checkConfigHasRequiredValues,
    validateAuthParams: validateAuthParams,
    validateRequiredScanParams: validateRequiredScanParams
};
