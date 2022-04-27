"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLambdaPolicies = exports.getLayersLinks = exports.getLambdaFunctionConfiguration = exports.getLambdaClient = void 0;
const lambdaConfig_json_1 = __importDefault(require("./lambdaConfig.json"));
const getLambdaClient = (lambdaOptions) => {
    return {};
};
exports.getLambdaClient = getLambdaClient;
const getLambdaFunctionConfiguration = async (client, lambdaOptions) => {
    return Promise.resolve(lambdaConfig_json_1.default);
};
exports.getLambdaFunctionConfiguration = getLambdaFunctionConfiguration;
const getLayersLinks = async (client, functionConfiguration) => {
    return [];
};
exports.getLayersLinks = getLayersLinks;
const getLambdaPolicies = async (functionConfiguration, lambdaOptions) => [];
exports.getLambdaPolicies = getLambdaPolicies;
