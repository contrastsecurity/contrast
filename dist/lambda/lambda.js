"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLambda = void 0;
const command_line_args_1 = __importDefault(require("command-line-args"));
const perf_hooks_1 = require("perf_hooks");
const lodash_1 = require("lodash");
const i18n_1 = __importDefault(require("i18n"));
const paramHandler_1 = require("../utils/paramsUtil/paramHandler");
const cliError_1 = require("./cliError");
const constants_1 = require("./constants");
const help_1 = require("./help");
const logUtils_1 = require("./logUtils");
const scanDetailCompletion_1 = require("./scanDetailCompletion");
const scanRequest_1 = require("./scanRequest");
const scanResults_1 = require("./scanResults");
const utils_1 = require("./utils");
const failedStates = [
    'UNSUPPORTED',
    'EXCLUDED',
    'CANCELED',
    'FAILED',
    'DISMISSED'
];
const printHelpMessage = () => {
    (0, logUtils_1.log)(help_1.lambdaUsageGuide);
};
const getLambdaOptions = (argv) => {
    const lambdaDefinitions = [
        { name: 'function-name', alias: 'f', type: String },
        { name: 'region', alias: 'r', type: String },
        { name: 'endpoint-url', alias: 'e', type: String },
        { name: 'profile', alias: 'p', type: String },
        { name: 'help', alias: 'h', type: Boolean },
        { name: 'verbose', alias: 'v', type: Boolean },
        { name: 'json-output', alias: 'j', type: Boolean }
    ];
    const lambdaOptions = (0, command_line_args_1.default)(lambdaDefinitions, {
        argv,
        partial: true,
        camelCase: true,
        caseInsensitive: true
    });
    return lambdaOptions;
};
const processLambda = async (argv) => {
    const lambdaOptions = getLambdaOptions(argv);
    const { help } = lambdaOptions;
    if (help) {
        return handleLambdaHelp();
    }
    try {
        validateRequiredLambdaParams(lambdaOptions);
        await actualProcessLambda(lambdaOptions);
    }
    catch (error) {
        if (error instanceof cliError_1.CliError) {
            console.error(error.getErrorMessage());
        }
        else if (error instanceof Error) {
            console.error(error.message);
        }
        process.exit(1);
    }
};
exports.processLambda = processLambda;
const actualProcessLambda = async (lambdaOptions) => {
    const auth = (0, paramHandler_1.getAuth)();
    const startTime = perf_hooks_1.performance.now();
    const { jsonOutput } = lambdaOptions;
    const { scanId, params, functionArn } = await (0, scanRequest_1.requestScanFunctionPost)(auth, lambdaOptions);
    const scans = await (0, scanDetailCompletion_1.pollScanUntilCompletion)(auth, 10, params, scanId);
    const failedScan = scans
        ?.filter((s) => s.scanType === 2)
        .find((s) => failedStates.includes(s.state));
    if (failedScan) {
        throw new cliError_1.CliError(constants_1.ERRORS.FAILED_TO_GET_SCAN, {
            statusCode: 200,
            errorCode: failedScan.state,
            description: failedScan.stateReasonText
        });
    }
    const resultsResponse = await (0, scanResults_1.getScanResults)(auth, params, scanId, functionArn);
    if (jsonOutput) {
        console.log(JSON.stringify(resultsResponse?.data?.results, null, 2));
        return;
    }
    const results = resultsResponse?.data?.results;
    if (!results) {
        throw new cliError_1.CliError(constants_1.ERRORS.FAILED_TO_GET_RESULTS, {
            errorCode: 'missingResults'
        });
    }
    if (!results.length) {
        (0, logUtils_1.log)('👏 No vulnerabilities found');
    }
    const endTime = perf_hooks_1.performance.now();
    const scanDurationMs = endTime - startTime;
    (0, logUtils_1.log)(`----- Scan completed ${(scanDurationMs / 1000).toFixed(2)}s -----`);
    if (results?.length) {
        (0, utils_1.prettyPrintResults)(results);
    }
};
const validateRequiredLambdaParams = (options) => {
    if (options._unknown?.length) {
        throw new cliError_1.CliError(constants_1.ERRORS.VALIDATION_FAILED, {
            description: i18n_1.default.__('notSupportedFlags', options._unknown.join('\n'))
        });
    }
    if (!options?.functionName) {
        throw new cliError_1.CliError(constants_1.ERRORS.VALIDATION_FAILED, {
            errorCode: 'missingFunctionName'
        });
    }
    const flagsWithoutValues = Object.entries(options)
        .filter(([, value]) => !value)
        .map(([key]) => key)
        .map(p => `--${(0, lodash_1.kebabCase)(p)}`);
    if (flagsWithoutValues.length) {
        throw new cliError_1.CliError(constants_1.ERRORS.VALIDATION_FAILED, {
            description: i18n_1.default.__('missingFlagArguments', flagsWithoutValues.join('\n'))
        });
    }
};
const handleLambdaHelp = () => {
    printHelpMessage();
    process.exit(0);
};
