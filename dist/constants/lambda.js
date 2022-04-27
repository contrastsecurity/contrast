"use strict";
const lambda = {
    failedToStartScan: 'Failed to start scan',
    failedToParseArn: 'Failed to parse ARN',
    failedToGetScan: 'Failed to get scan',
    missingLambdaConfig: 'Missing Lambda Configuration',
    missingLambdaArn: 'Missing Lambda ARN',
    validationFailed: 'Request validation failed',
    missingFunctionName: 'Required parameter --function-name is missing.\nRun command with --help to see usage',
    failedToGetResults: 'Failed to get results',
    missingResults: 'Missing vulnerabilities',
    missingParameter: 'Required function parameter is missing',
    awsError: 'AWS error',
    missingFlagArguments: 'The following flags are missing an arguments:\n%s',
    notSupportedFlags: 'The following flags are not supported:\n%s\nRun command with --help to see usage',
    something_went_wrong: 'Something went wrong',
    not_found_404: '404 error - Not found',
    internal_error: 'Internal error',
    inactive_account: 'Scanning a function of an inactive account is not supported',
    not_supported_runtime: 'Scanning resource of runtime "%s" is not supported.\nSupported runtimes: %s',
    not_supported_onboard_account: 'Scanning a function of onboard account is not supported',
    scan_lock: 'Other scan is still running. Please wait until the previous scan finishes',
    unsupported: 'unsupported',
    excluded: 'excluded',
    canceled: 'canceled',
    failed: 'failed',
    dismissed: 'dismissed'
};
module.exports = {
    lambda
};
