"use strict";
const commandLineUsage = require('command-line-usage');
const i18n = require('i18n');
const { en_locales } = require('./constants/locales.js');
i18n.configure({
    staticCatalog: {
        en: en_locales()
    },
    defaultLocale: 'en'
});
const scanOptionDefinitions = [
    {
        name: 'name',
        alias: 'n',
        description: '{bold ' +
            i18n.__('constantsOptional') +
            '}: ' +
            i18n.__('constantsProjectName')
    },
    {
        name: 'file',
        alias: 'f',
        description: '{bold ' +
            i18n.__('constantsOptional') +
            '}: ' +
            i18n.__('constantsFileName')
    },
    {
        name: 'project-id',
        alias: 'p',
        description: '{bold ' +
            i18n.__('constantsOptional') +
            '}: ' +
            i18n.__('constantsProjectId')
    },
    {
        name: 'timeout',
        alias: 't',
        type: Number,
        description: '{bold ' +
            i18n.__('constantsOptional') +
            '}: ' +
            i18n.__('constantsScanTimeout')
    },
    {
        name: 'language',
        alias: 'l',
        description: '{bold ' +
            i18n.__('constantsRequiredCatalogue') +
            '}: ' +
            i18n.__('constantsLanguage')
    },
    {
        name: 'organization-id',
        alias: 'o',
        description: '{bold ' +
            i18n.__('constantsRequired') +
            '}: ' +
            i18n.__('constantsOrganizationId')
    },
    {
        name: 'yaml-path',
        alias: 'y',
        description: '{bold ' +
            i18n.__('constantsOptional') +
            '}: ' +
            i18n.__('constantsYamlPath')
    },
    {
        name: 'api-key',
        description: '{bold ' +
            i18n.__('constantsRequired') +
            '}: ' +
            i18n.__('constantsApiKey')
    },
    {
        name: 'authorization',
        description: '{bold ' +
            i18n.__('constantsRequired') +
            '}: ' +
            i18n.__('constantsAuthorization')
    },
    {
        name: 'host',
        alias: 'h',
        defaultValue: 'app.contrastsecurity.com',
        description: '{bold ' +
            i18n.__('constantsRequired') +
            '}: ' +
            i18n.__('constantsHostId')
    },
    {
        name: 'proxy',
        description: '{bold ' +
            i18n.__('constantsOptional') +
            '}: ' +
            i18n.__('constantsProxyServer')
    },
    {
        name: 'ff',
        type: Boolean,
        description: '{bold ' +
            i18n.__('constantsOptional') +
            '}: ' +
            i18n.__('constantsProxyServer')
    },
    {
        name: 'ignore-cert-errors',
        type: Boolean,
        description: '{bold ' +
            i18n.__('constantsOptional') +
            '}:' +
            i18n.__('constantsIgnoreCertErrors')
    },
    {
        name: 'help',
        type: Boolean
    }
];
const mainUsageGuide = commandLineUsage([
    {
        header: i18n.__('constantsHeader'),
        content: [i18n.__('constantsContrastContent')]
    },
    {
        header: i18n.__('constantsUsage'),
        content: [i18n.__('constantsUsageCommandExample')]
    },
    {
        header: i18n.__('constantsCommands'),
        content: [
            { name: i18n.__('authName'), summary: i18n.__('helpAuthSummary') },
            { name: i18n.__('lambdaName'), summary: i18n.__('helpLambdaSummary') },
            { name: i18n.__('versionName'), summary: i18n.__('helpVersionSummary') },
            { name: i18n.__('configName'), summary: i18n.__('helpConfigSummary') },
            { name: i18n.__('helpName'), summary: i18n.__('helpSummary') }
        ]
    },
    {
        content: '{underline https://www.contrastsecurity.com}'
    }
]);
const mainDefinition = [{ name: 'command', defaultOption: true }];
module.exports = {
    commandLineDefinitions: {
        mainUsageGuide,
        mainDefinition,
        scanOptionDefinitions
    }
};
