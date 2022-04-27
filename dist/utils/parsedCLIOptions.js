"use strict";
const constants = require('../constants');
const commandLineArgs = require('command-line-args');
const getCommandLineArgs = () => {
    return commandLineArgs(constants.commandLineDefinitions.scanOptionDefinitions, {
        partial: true,
        camelCase: true,
        caseInsensitive: true
    });
};
module.exports = {
    getCommandLineArgs: getCommandLineArgs
};
