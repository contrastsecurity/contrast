"use strict";
const { startScan } = require('../../scan/scanController');
const paramHandler = require('../../utils/paramsUtil/paramHandler');
const { formatScanOutput } = require('../../scan/scan');
const { scanUsageGuide } = require('../../scan/help');
const processScan = async () => {
    let getScanSubCommands = paramHandler.getScanSubCommands();
    if (getScanSubCommands.help) {
        printHelpMessage();
        process.exit(1);
    }
    let scanResults = await startScan();
    if (scanResults) {
        formatScanOutput(scanResults?.projectOverview, scanResults?.scanResultsInstances);
    }
};
const printHelpMessage = () => {
    console.log(scanUsageGuide);
};
module.exports = {
    processScan,
    printHelpMessage
};
