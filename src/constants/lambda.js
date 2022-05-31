const lambda = {
  failedToStartScan: 'Failed to start scan',
  failedToParseArn: 'Failed to parse ARN',
  failedToGetScan: 'Failed to get scan',
  missingLambdaConfig: 'Missing Lambda Configuration',
  missingLambdaArn: 'Missing Lambda ARN',
  validationFailed: 'Request validation failed',
  missingFunctionName:
    'Required parameter --function-name is missing.\nRun command with --help to see usage',
  failedToGetResults: 'Failed to get results',
  missingResults: 'Missing vulnerabilities',
  awsError: 'AWS error',
  missingFlagArguments:
    'The following flags are missing an arguments:\n{{flags}}',
  notSupportedFlags:
    'The following flags are not supported:\n{{flags}}\nRun command with --help to see usage',
  layerNotFound:
    'The layer {{layerArn}} could not be found. The scan will continue without it',

  // ====== general ===== //
  noVulnerabilitiesFound: '👏 No vulnerabilities found',
  scanCompleted: '----- Scan completed {{time}}s -----',
  sendingScanRequest:
    '{{icon}} Sending Lambda Function scan request to Contrast',
  scanRequestedSuccessfully: '{{icon}} Scan requested successfully',
  fetchingConfiguration:
    '{{icon}} Fetching configuration and policies for Lambda Function {{functionName}}',
  fetchedConfiguration: '{{icon}} Fetched configuration from AWS',

  // ====== scan polling ===== //
  scanStarted: 'Scan Started',
  scanFailed: 'Scan Failed',
  scanTimedOut: 'Scan timed out',

  // ====== lambda utils ===== //
  loadingFunctionList: 'Loading lambda function list',
  functionsFound: '{{count}} functions found',
  noFunctionsFound: 'No functions found',
  failedToLoadFunctions: 'Faled to load lambda functions',
  availableForScan: '{{icon}} {{count}} available for scan',
  runtimeCount: '----- {{runtime}} ({{count}}) -----',

  // ====== print vulnerabilities ===== //
  whatHappenedTitle: 'What happened:',
  whatHappenedItem: '{{policy}} have:\n{{comments}}\n',
  recommendation: 'Recommendation:',
  vulnerableDependency: 'Vulnerable dependency',
  dependenciesCount: {
    one: '1 Dependency',
    other: '%s Dependencies'
  },
  foundVulnerabilities: {
    one: 'Found 1 vulnerability',
    other: 'Found %s vulnerabilities'
  },
  vulnerableDependencyDescriptions:
    '{packageName} (v{version}) has {NUM} known {NUM, plural,one{CVE}other{CVEs}}\n {cves}',

  // ====== errorCodes ===== //
  something_went_wrong: 'Something went wrong',
  not_found_404: '404 error - Not found',
  internal_error: 'Internal error',
  inactive_account:
    'Scanning a function of an inactive account is not supported',
  not_supported_runtime:
    'Scanning resource of runtime "{{runtime}}" is not supported.\nSupported runtimes: {{supportedRuntimes}}',
  not_supported_onboard_account:
    'Scanning a function of onboard account is not supported',
  scan_lock:
    'Other scan is still running. Please wait until the previous scan finishes',

  // ====== statuses ===== //
  unsupported: 'unsupported',
  excluded: 'excluded',
  canceled: 'canceled',
  failed: 'failed',
  dismissed: 'dismissed'
}

module.exports = {
  lambda
}
