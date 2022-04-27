"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScanResources = exports.pollScanUntilCompletion = void 0;
const requestUtils_1 = require("../utils/requestUtils");
const commonApi_1 = require("../utils/commonApi");
const oraWrapper_1 = __importDefault(require("../utils/oraWrapper"));
const cliError_1 = require("./cliError");
const constants_1 = require("./constants");
const MS_IN_MINUTE = 1000 * 60;
const getScanResources = async (config, params, scanId, httpClient) => {
    const res = await httpClient.getScanResources(config, params, scanId);
    const { statusCode, body } = res;
    if (statusCode === 200) {
        return res;
    }
    const { errorCode } = body || {};
    throw new cliError_1.CliError(constants_1.ERRORS.FAILED_TO_GET_SCAN, { statusCode, errorCode });
};
exports.getScanResources = getScanResources;
const pollScanUntilCompletion = async (config, timeoutInMinutes, params, scanId) => {
    const client = (0, commonApi_1.getHttpClient)(config);
    const activeStatuses = ['PENDING', 'SCANNING', 'QUEUED'];
    const startedText = 'Scan started';
    const maxEndTime = new Date().getTime() + timeoutInMinutes * MS_IN_MINUTE;
    const startScanSpinner = oraWrapper_1.default.returnOra(startedText);
    oraWrapper_1.default.startSpinner(startScanSpinner);
    await (0, requestUtils_1.sleep)(5000);
    let complete = false;
    while (!complete) {
        try {
            const result = await exports.getScanResources(config, params, scanId, client);
            const { resources: scans } = result.body.data;
            const staticScans = scans?.filter((s) => s.scanType === 2);
            complete = staticScans.some((s) => !activeStatuses.includes(s.state));
            if (complete) {
                oraWrapper_1.default.succeedSpinner(startScanSpinner, 'Scan Finished');
                return scans;
            }
            await (0, requestUtils_1.sleep)(2 * 1000);
        }
        catch (error) {
            oraWrapper_1.default.failSpinner(startScanSpinner, 'Scan Failed');
            throw error;
        }
        if (Date.now() >= maxEndTime) {
            oraWrapper_1.default.failSpinner(startScanSpinner, 'Scan timed out');
            throw new cliError_1.CliError(constants_1.ERRORS.FAILED_TO_GET_SCAN, {
                errorCode: 'waitingTimedOut'
            });
        }
    }
};
exports.pollScanUntilCompletion = pollScanUntilCompletion;
