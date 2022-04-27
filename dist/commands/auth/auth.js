"use strict";
const { v4: uuidv4 } = require('uuid');
const { setConfigValues } = require('../../utils/getConfig');
const open = require('open');
const commonApi = require('../../utils/commonApi');
const { sleep } = require('../../utils/requestUtils');
const i18n = require('i18n');
const { returnOra, startSpinner, failSpinner, succeedSpinner } = require('../../utils/oraWrapper');
const { TIMEOUT, AUTH_UI_URL } = require('../../constants/constants');
const processAuth = async (config) => {
    const token = uuidv4();
    const url = `${AUTH_UI_URL}/?token=${token}`;
    console.log(i18n.__('redirectAuth', url));
    try {
        await setTimeout(() => {
            open(url);
        }, 0);
        const result = await isAuthComplete(token, TIMEOUT, config);
        if (result) {
            setConfigValues(config, result);
        }
        return;
    }
    finally {
    }
};
const isAuthComplete = async (token, timeout, config) => {
    const authSpinner = returnOra(i18n.__('authWaitingMessage'));
    startSpinner(authSpinner);
    const client = commonApi.getHttpClient(config);
    let startTime = new Date();
    let complete = false;
    while (!complete) {
        let result = await pollAuthResult(token, client);
        if (result.statusCode === 200) {
            succeedSpinner(authSpinner, i18n.__('authSuccessMessage'));
            console.log(i18n.__('runScanMessage'));
            return result.body;
        }
        let endTime = new Date() - startTime;
        if (endTime > timeout) {
            failSpinner(authSpinner, i18n.__('authTimedOutMessage'));
            process.exit(1);
            return;
        }
    }
};
const pollAuthResult = async (token, client) => {
    await sleep(5000);
    return client
        .pollForAuth(token)
        .then(res => {
        return res;
    })
        .catch(err => {
        console.log(err);
    });
};
module.exports = {
    processAuth: processAuth
};
