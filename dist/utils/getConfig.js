"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfigValues = exports.createConfigFromYaml = exports.localConfig = void 0;
const conf_1 = __importDefault(require("conf"));
const localConfig = (name, version) => {
    const config = new conf_1.default({
        configName: name
    });
    config.set('version', version);
    if (!config.has('host')) {
        config.set('host', 'https://ce.contrastsecurity.com/');
    }
    return config;
};
exports.localConfig = localConfig;
const createConfigFromYaml = (yamlPath) => {
    const yamlConfig = {};
    return yamlConfig;
};
exports.createConfigFromYaml = createConfigFromYaml;
const setConfigValues = (config, values) => {
    config.set('apiKey', values.apiKey);
    config.set('organizationId', values.orgId);
    config.set('authorization', values.authHeader);
    values.host ? config.set('host', values.host) : null;
};
exports.setConfigValues = setConfigValues;
