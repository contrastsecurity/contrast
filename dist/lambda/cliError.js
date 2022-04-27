"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliError = void 0;
const i18n_1 = __importDefault(require("i18n"));
const errorHandling = __importStar(require("../common/errorHandling"));
class CliError extends Error {
    constructor(headerMessage, details) {
        const message = i18n_1.default.__(headerMessage || '');
        super(message);
        const { statusCode, errorCode, data, description } = details || {};
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.data = data;
        this.description = description;
        if (errorCode) {
            this.errorCodeDescription = i18n_1.default.__(errorCode || '');
        }
        if (statusCode) {
            this.statusCodeDescription = this.getMessageByStatusCode(statusCode);
        }
    }
    getErrorMessage() {
        let finalDesc = this.errorCodeDescription || this.statusCodeDescription || '';
        if (this.description) {
            finalDesc += finalDesc ? `\n${this.description}` : this.description;
        }
        return errorHandling.getErrorMessage(this.message, finalDesc);
    }
    getMessageByStatusCode(statusCode) {
        switch (statusCode) {
            case 200:
                return '';
            case 400:
                return i18n_1.default.__('badRequestErrorHeader');
            case 401:
                return i18n_1.default.__('unauthenticatedErrorHeader');
            case 403:
                return i18n_1.default.__('forbiddenRequestErrorHeader');
            case 404:
                return i18n_1.default.__('not_found_404');
            case 423:
                return i18n_1.default.__('resourceLockedErrorHeader');
            case 500:
                return i18n_1.default.__('internalServerErrorHeader');
            default:
                return i18n_1.default.__('something_went_wrong');
        }
    }
}
exports.CliError = CliError;
