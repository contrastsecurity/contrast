"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseARN = void 0;
const cliError_1 = require("./cliError");
const constants_1 = require("./constants");
const ARN_REGEX = /arn:(?<partition>[^:\n]*):(?<service>[^:\n]*):(?<region>[^:\n]*):(?<accountId>[^:\n]*):(?<ignore>(?<resource>[^:/\n]*)[:/])?(?<resourceId>.*)/;
const parseARN = (arn) => {
    if (!arn) {
        throw new cliError_1.CliError(constants_1.ERRORS.FAILED_TO_START_SCAN, {
            errorCode: 'failedToParseArn'
        });
    }
    const arnMatch = arn.match(ARN_REGEX);
    if (!arnMatch) {
        throw new cliError_1.CliError(constants_1.ERRORS.FAILED_TO_START_SCAN, {
            errorCode: 'failedToParseArn'
        });
    }
    return arnMatch.groups;
};
exports.parseARN = parseARN;
