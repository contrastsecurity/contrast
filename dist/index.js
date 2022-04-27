"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_line_args_1 = __importDefault(require("command-line-args"));
const auth_1 = require("./commands/auth/auth");
const config_1 = require("./commands/config/config");
const processScan_1 = require("./commands/scan/processScan");
const constants_1 = __importDefault(require("./constants"));
const constants_2 = require("./constants/constants");
const lambda_1 = require("./lambda/lambda");
const getConfig_1 = require("./utils/getConfig");
const { commandLineDefinitions: { mainUsageGuide, mainDefinition } } = constants_1.default;
const config = (0, getConfig_1.localConfig)(constants_2.APP_NAME, constants_2.APP_VERSION);
const getMainOption = () => {
    const mainOptions = (0, command_line_args_1.default)(mainDefinition, {
        stopAtFirstUnknown: true,
        camelCase: true,
        caseInsensitive: true
    });
    const argv = mainOptions._unknown || [];
    return {
        mainOptions,
        argv
    };
};
const start = async () => {
    const { mainOptions, argv: argvMain } = getMainOption();
    const command = mainOptions.command != undefined ? mainOptions.command.toLowerCase() : '';
    if (command === 'version') {
        console.log(constants_2.APP_VERSION);
        return;
    }
    if (command === 'config') {
        return (0, config_1.processConfig)(argvMain, config);
    }
    if (command === 'auth') {
        return await (0, auth_1.processAuth)(config);
    }
    if (command === 'lambda') {
        return await (0, lambda_1.processLambda)(argvMain);
    }
    if (command === 'scan') {
        return await (0, processScan_1.processScan)();
    }
    if (command === 'help' ||
        argvMain.includes('--help') ||
        Object.keys(mainOptions).length === 0) {
        console.log(mainUsageGuide);
    }
    else {
        console.log('Unknown Command: ' + command + ' \nUse --help for the full list');
    }
};
start();
