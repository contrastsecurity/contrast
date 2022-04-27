"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScanResults = void 0;
const commonApi_1 = require("../utils/commonApi");
const cliError_1 = require("./cliError");
const constants_1 = require("./constants");
const getScanResults = async (config, params, scanId, functionArn) => {
    const client = (0, commonApi_1.getHttpClient)(config);
    const { statusCode, body } = await client.getFunctionScanResults(config, params, scanId, functionArn);
    if (statusCode === 200) {
        return body;
    }
    const { errorCode } = body || {};
    throw new cliError_1.CliError(constants_1.ERRORS.FAILED_TO_GET_RESULTS, { statusCode, errorCode });
};
exports.getScanResults = getScanResults;
