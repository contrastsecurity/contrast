"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambdaUsageGuide = void 0;
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const i18n_1 = __importDefault(require("i18n"));
const lambdaUsageGuide = (0, command_line_usage_1.default)([
    {
        header: i18n_1.default.__('lambdaHeader'),
        content: [i18n_1.default.__('lambdaSummary')]
    },
    {
        header: i18n_1.default.__('constantsPrerequisitesHeader'),
        content: [i18n_1.default.__('lambdaPrerequisitesContent')]
    },
    {
        header: i18n_1.default.__('constantsUsage'),
        content: [i18n_1.default.__('lambdaUsage')]
    },
    {
        header: i18n_1.default.__('constantsOptions'),
        content: [
            {
                name: i18n_1.default.__('lambdaFunctionNameOption'),
                summary: i18n_1.default.__('lambdaFunctionNameSummery')
            },
            {
                name: i18n_1.default.__('lambdaEndpointOption'),
                summary: '{italic ' +
                    i18n_1.default.__('constantsOptional') +
                    '}: ' +
                    i18n_1.default.__('lambdaEndpointSummery')
            },
            {
                name: i18n_1.default.__('lambdaRegionOption'),
                summary: '{italic ' +
                    i18n_1.default.__('constantsOptional') +
                    '}: ' +
                    i18n_1.default.__('lambdaRegionSummery')
            },
            {
                name: i18n_1.default.__('lambdaProfileOption'),
                summary: '{italic ' +
                    i18n_1.default.__('constantsOptional') +
                    '}: ' +
                    i18n_1.default.__('lambdaProfileSummery')
            },
            {
                name: i18n_1.default.__('lambdaJsonOption'),
                summary: '{italic ' +
                    i18n_1.default.__('constantsOptional') +
                    '}: ' +
                    i18n_1.default.__('lambdaJsonSummery')
            },
            {
                name: i18n_1.default.__('lambdaVerboseOption'),
                summary: '{italic ' +
                    i18n_1.default.__('constantsOptional') +
                    '}: ' +
                    i18n_1.default.__('lambdaVerbosSummery')
            }
        ]
    },
    {
        content: [
            { name: i18n_1.default.__('lambdaHelpOption'), summary: i18n_1.default.__('helpSummary') }
        ]
    },
    {
        content: '{underline https://www.contrastsecurity.com}'
    }
]);
exports.lambdaUsageGuide = lambdaUsageGuide;
