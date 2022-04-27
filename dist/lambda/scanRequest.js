"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFunctionEvent = exports.requestScanFunctionPost = exports.sendScanPostRequest = void 0;
const i18n_1 = __importDefault(require("i18n"));
const log_symbols_1 = __importDefault(require("log-symbols"));
const chalk_1 = __importDefault(require("chalk"));
const arn_1 = require("./arn");
const aws_1 = require("./aws");
const utils_1 = require("./utils");
const commonApi_1 = require("../utils/commonApi");
const logUtils_1 = require("./logUtils");
const cliError_1 = require("./cliError");
const constants_1 = require("./constants");
const sendScanPostRequest = async (config, params, functionsEvent, showProgress = false) => {
    const client = (0, commonApi_1.getHttpClient)(config);
    if (showProgress) {
        (0, logUtils_1.log)(`${log_symbols_1.default.success} Sending Lambda Function scan request to Contrast`);
    }
    const res = await client.postFunctionScan(config, params, functionsEvent);
    const { statusCode, body } = res;
    if (statusCode === 201) {
        if (showProgress) {
            (0, logUtils_1.log)(`${log_symbols_1.default.success} Scan requested successfully`);
        }
        return body?.data?.scanId;
    }
    let { errorCode } = body?.data || {};
    const { data } = body?.data || {};
    let description = '';
    switch (errorCode) {
        case 'not_supported_runtime':
            description = i18n_1.default.__(errorCode, data?.runtime, data?.supportedRuntimes.sort().join(' | '));
            errorCode = false;
            break;
    }
    throw new cliError_1.CliError(constants_1.ERRORS.FAILED_TO_START_SCAN, {
        statusCode,
        errorCode,
        data,
        description
    });
};
exports.sendScanPostRequest = sendScanPostRequest;
const createFunctionEvent = (lambdaConfig, layersLinks, lambdaPolicies) => {
    delete lambdaConfig.$metadata;
    const functionEvent = (0, utils_1.toLowerKeys)(lambdaConfig.Configuration);
    functionEvent['code'] = lambdaConfig.Code;
    functionEvent['rolePolicies'] = lambdaPolicies;
    if (layersLinks) {
        functionEvent['layers'] = layersLinks;
    }
    return { function: functionEvent };
};
exports.createFunctionEvent = createFunctionEvent;
const requestScanFunctionPost = async (config, lambdaOptions) => {
    const { verbose, jsonOutput, functionName } = lambdaOptions;
    const lambdaClient = (0, aws_1.getLambdaClient)(lambdaOptions);
    if (!jsonOutput) {
        (0, logUtils_1.log)(`${log_symbols_1.default.success} Fetching configuration and policies for Lambda Function ${chalk_1.default.bold(functionName)}`);
    }
    const lambdaConfig = await (0, aws_1.getLambdaFunctionConfiguration)(lambdaClient, lambdaOptions);
    if (!lambdaConfig?.Configuration) {
        throw new cliError_1.CliError(constants_1.ERRORS.FAILED_TO_START_SCAN, {
            errorCode: 'missingLambdaConfig'
        });
    }
    const { Configuration } = lambdaConfig;
    const layersLinks = await (0, aws_1.getLayersLinks)(lambdaClient, Configuration);
    const lambdaPolicies = await (0, aws_1.getLambdaPolicies)(Configuration, lambdaOptions);
    const functionEvent = createFunctionEvent(lambdaConfig, layersLinks, lambdaPolicies);
    const { FunctionArn: functionArn } = Configuration;
    if (!functionArn) {
        throw new cliError_1.CliError(constants_1.ERRORS.FAILED_TO_START_SCAN, {
            errorCode: 'missingLambdaArn'
        });
    }
    const parsedARN = (0, arn_1.parseARN)(functionArn);
    const params = {
        organizationId: config.organizationId,
        provider: 'aws',
        accountId: parsedARN.accountId
    };
    if (verbose) {
        (0, logUtils_1.log)(`${log_symbols_1.default.success} Fetched configuration from AWS:`);
        (0, logUtils_1.prettyPrintJson)(functionEvent);
    }
    const scanId = await sendScanPostRequest(config, params, functionEvent, !jsonOutput);
    return { scanId, params, functionArn };
};
exports.requestScanFunctionPost = requestScanFunctionPost;
