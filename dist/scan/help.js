"use strict";
const commandLineUsage = require('command-line-usage');
const i18n = require('i18n');
const scanUsageGuide = commandLineUsage([
    {
        header: i18n.__('scanHeader')
    },
    {
        header: i18n.__('constantsPrerequisitesHeader'),
        content: [
            '{bold ' + i18n.__('constantsPrerequisitesContentScanLanguages') + '}',
            i18n.__('constantsPrerequisitesContent'),
            '',
            i18n.__('constantsUsageCommandInfo'),
            i18n.__('constantsUsageCommandInfo24Hours')
        ]
    },
    {
        header: i18n.__('constantsScanOptions'),
        content: [
            {
                name: i18n.__('scanOptionsFileName'),
                summary: '{italic ' +
                    i18n.__('constantsOptional') +
                    '}: ' +
                    i18n.__('scanOptionsFileNameSummary')
            },
            {
                name: i18n.__('scanOptionsLanguage'),
                summary: '{italic ' +
                    i18n.__('constantsOptional') +
                    '}: ' +
                    i18n.__('scanOptionsLanguageSummaryOptional') +
                    '{italic ' +
                    i18n.__('constantsRequired') +
                    '}: ' +
                    i18n.__('scanOptionsLanguageSummaryRequired')
            },
            {
                name: i18n.__('scanOptionsName'),
                summary: '{italic ' +
                    i18n.__('constantsOptional') +
                    '}: ' +
                    i18n.__('scanOptionsNameSummary')
            },
            {
                name: i18n.__('scanOptionsTimeout'),
                summary: '{italic ' +
                    i18n.__('constantsOptional') +
                    '}: ' +
                    i18n.__('scanOptionsTimeoutSummary')
            },
            {
                name: i18n.__('scanOptionsVerbose'),
                summary: '{italic ' +
                    i18n.__('constantsOptional') +
                    '}: ' +
                    i18n.__('scanOptionsVerboseSummary')
            }
        ]
    },
    {
        content: '{underline https://www.contrastsecurity.com}'
    }
]);
module.exports = {
    scanUsageGuide
};
