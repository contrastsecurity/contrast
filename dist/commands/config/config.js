"use strict";
const commandLineArgs = require('command-line-args');
const processConfig = (argv, config) => {
    const options = [{ name: 'clear', alias: 'c', type: Boolean }];
    try {
        const configOptions = commandLineArgs(options, {
            argv,
            caseInsensitive: true,
            camelCase: true
        });
        if (configOptions.clear) {
            config.clear();
        }
        else {
            console.log(JSON.parse(JSON.stringify(config.store)));
        }
    }
    catch (e) {
        console.log(e.message.toString());
    }
};
module.exports = {
    processConfig: processConfig
};
