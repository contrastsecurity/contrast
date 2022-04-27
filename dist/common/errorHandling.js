"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = exports.generalError = exports.hostWarningError = exports.failOptionError = exports.proxyError = exports.forbiddenError = exports.badRequestError = exports.unauthenticatedError = exports.genericError = void 0;
const i18n_1 = __importDefault(require("i18n"));
const genericError = (missingCliOption) => {
    console.log(`*************************** ${i18n_1.default.__('yamlMissingParametersHeader')} ***************************\n${missingCliOption}`);
    console.error(i18n_1.default.__('yamlMissingParametersMessage'));
    process.exit(1);
};
exports.genericError = genericError;
const unauthenticatedError = () => {
    generalError('unauthenticatedErrorHeader', 'unauthenticatedErrorMessage');
};
exports.unauthenticatedError = unauthenticatedError;
const badRequestError = (catalogue) => {
    catalogue === true
        ? generalError('badRequestErrorHeader', 'badRequestCatalogueErrorMessage')
        : generalError('badRequestErrorHeader', 'badRequestErrorMessage');
};
exports.badRequestError = badRequestError;
const forbiddenError = () => {
    generalError('forbiddenRequestErrorHeader', 'forbiddenRequestErrorMessage');
};
exports.forbiddenError = forbiddenError;
const proxyError = () => {
    generalError('proxyErrorHeader', 'proxyErrorMessage');
};
exports.proxyError = proxyError;
const hostWarningError = () => {
    console.log(i18n_1.default.__('snapshotHostMessage'));
};
exports.hostWarningError = hostWarningError;
const failOptionError = () => {
    console.log('\n ******************************** ' +
        i18n_1.default.__('snapshotFailureHeader') +
        ' ********************************\n' +
        i18n_1.default.__('failOptionErrorMessage'));
};
exports.failOptionError = failOptionError;
const getErrorMessage = (header, message) => {
    const title = `******************************** ${i18n_1.default.__(header)} ********************************`;
    const multiLine = message?.includes('\n');
    let finalMessage = '';
    if (multiLine) {
        finalMessage = `\n${message}`;
    }
    else if (message) {
        finalMessage = `\n${i18n_1.default.__(message)}`;
    }
    return `${title}${finalMessage}`;
};
exports.getErrorMessage = getErrorMessage;
const generalError = (header, message) => {
    const finalMessage = getErrorMessage(header, message);
    console.log(finalMessage);
};
exports.generalError = generalError;
