const { lambda } = require('./lambda')
const chalk = require('chalk')

const en_locales = () => {
  return {
    successHeader: 'SUCCESS',
    snapshotSuccessMessage:
      'Please go to the Contrast UI to view your dependency tree.',
    snapshotFailureHeader: 'FAIL',
    snapshotFailureMessage: 'Library analysis failed',
    snapshotHostMessage:
      "No host supplied. Using default host 'app.contrastsecurity.com'. Please ensure this is correct.",
    vulnerabilitiesSuccessMessage: 'Vulnerability data successfully retrieved',
    vulnerabilitiesFailureMessage: 'Unable to retrieve library vulnerabilities',
    catchErrorMessage: 'Contrast UI error: ',
    dependenciesNote:
      'Please Note: We currently only support projects with one .csproj AND *.package.lock.json',
    languageAnalysisFailureMessage: 'SCA audit Failure',
    languageAnalysisFactoryFailureHeader: 'FAIL',
    libraryAnalysisError:
      'Please ensure the language parameter is set in accordance to the language specified on the project path.\nContrast CLI must be run in the same directory as the project manifest file OR the project_path parameter must be used to identify the directory containing the project manifest file.\n\nFor further information please read our usage guide, which can be accessed with the following command:\n\ncontrast-cli --help',
    yamlMissingParametersHeader: 'Missing Parameters',
    genericErrorMessage:
      'An error has occur please check your command again. For more information use the --help commands.',
    unauthenticatedErrorHeader: '401 error - Unauthenticated',
    unauthenticatedErrorMessage:
      'Please check the following keys are correct:\n--organization-id, --api-key or --authorization',
    badRequestErrorHeader: '400 error - Bad Request',
    badRequestErrorMessage: 'Please check your parameters and try again',
    badRequestCatalogueErrorMessage:
      'The application name already exists, please use a unique name',
    forbiddenRequestErrorHeader: '403 error - Forbidden',
    forbiddenRequestErrorMessage:
      'You do not have permission to access this server.',
    proxyErrorHeader: '407 error - Proxy Authentication Required',
    proxyErrorMessage:
      'Please provide valid authentication credentials for the proxy server.',
    catalogueSuccessCommand: 'Application Created',
    dotnetAnalysisFailure: '.NET analysis failed because: ',
    dotnetReadLockfile: 'Failed to read the lock file @ %s because: ',
    dotnetParseLockfile: "Failed to parse .NET lock file @ '%s' because: ",
    dotnetParseProjectFile:
      "Failed to parse MSBuild project file @ '%s' because: ",
    dotnetReadProjectFile: 'Failed to read the project file @ "%s" because: ',
    javaAnalysisError: 'JAVA analysis failed because: ',
    javaParseProjectFile: 'Failed to parse mvn output because: ',
    languageAnalysisMultipleLanguages1:
      'Identified multiple languages for the project\n',
    languageAnalysisMultipleLanguages2:
      'Please specify which project file you would like analyzed with the %s CLI option.',
    languageAnalysisProjectFiles:
      "Identified project language as '%s' but found multiple project files: %s. Please specify which project file you would like analyzed with the %s CLI option.",
    languageAnalysisHasNoLockFile:
      "Identified project language as '%s' but no project lock file was found.",
    languageAnalysisHasNoPackageJsonFile:
      'Identified project language as javascript but no package.json file was found.',
    languageAnalysisHasMultipleLockFiles:
      "Identified project language as '%s' but multiple project lock files were found.",
    languageAnalysisProjectFileError:
      "Identified project language as '%s' but no project file was found.",
    languageAnalysisProjectRootFileNameReadError:
      'Failed to read the contents of the directory @ %s because: ',
    languageAnalysisProjectRootFileNameMissingError:
      "%s isn't a file or directory",
    languageAnalysisProjectRootFileNameFailure:
      'Failed to get information about the file or directory @ %s because: ',
    languageAnalysisFailure: ' analysis failed because: ',
    languageAnalysisNoLanguage:
      'We cannot detect a project, use -f <path> to specify a file or folder to analyze.',
    languageAnalysisNoLanguageHelpLine: `${chalk.bold(
      'contrast audit --help'
    )} for more information.`,
    NodeAnalysisFailure: 'NODE analysis failed because: ',
    phpAnalysisFailure: 'PHP analysis failed because: ',
    NodeParseNPM: 'Failed to parse NODE package-lock.json file because: ',
    phpParseComposerLock:
      "Failed to parse PHP composer.lock file @ '%s' because: ",
    NodeReadNpmError:
      'Failed to read the package-lock.json file @ "%s" because: ',
    phpReadError: 'Failed to read the composer.lock file @ "%s" because: ',
    NodeParseYarn: 'Failed to parse yarn.lock version %s because: ',
    NodeParseYarn2: "Failed to parse Node yarn.lock version 2 @ '%s' because: ",
    nodeReadProjectFileError:
      'Failed to read the NODE project file @ "%s" because: ',
    phpReadProjectFileError:
      'Failed to read the PHP project file @ "%s" because: ',
    nodeReadYarnLockFileError:
      'Failed to read the yarn.lock file @ "%s" because: ',
    pythonAnalysisEngineError: 'Python analysis failed because: ',
    pythonAnalysisEnginePipError:
      "Failed to parse python Pipfile.lock file @ '%s' because: ",
    pythonAnalysisParseProjectFileError:
      'Failed to parse python output "%s" because: ',
    pythonAnalysisReadPipFileError:
      'Failed to read the python Pipfile.lock file @ "%s" because: ',
    pythonAnalysisReadPythonProjectFileError:
      'Failed to read the python pipfile @ "%s" because: ',
    rubyAnalysisEngineError: 'Ruby analysis failed because: ',
    rubyAnalysisEngineParsedGemFileError:
      'Failed to parse ruby output "%s" because: ',
    rubyAnalysisEngineParsedGemLockFileError:
      'Failed to parse ruby Gemfile.lock output because: ',
    rubyAnalysisEngineReadGemFileError:
      'Failed to read the ruby project file @ "%s" because: ',
    rubyAnalysisEngineReadGemLockFileError:
      'Failed to read the ruby Gemfile.lock @ "%s" because: ',
    constantsOptional: '(optional)',
    constantsOptionalForCatalogue: '(optional for catalogue)',
    constantsRequired: '(required)',
    constantsRequiredCatalogue: '(required for catalogue)',
    constantsApiKey: 'An agent API key as provided by Contrast UI',
    constantsAuthorization:
      'Authorization credentials as provided by Contrast UI',
    constantsOrganizationId: 'The ID of your organization',
    constantsApplicationId:
      'The ID of the application cataloged by Contrast UI',
    constantsHostId:
      'Provide the name of the host and optionally the port expressed as "<host>:<port>".',
    constantsApplicationName:
      'The name of the application cataloged by Contrast UI',
    constantsCatalogueApplication:
      'Provide this if you want to catalogue an application',
    failOptionErrorMessage:
      ' FAIL - CVEs have been detected that match at least the cve_severity option specified.',
    failOptionMessage:
      ' Use with contrast scan or contrast audit. Detects failures based on the severity level specified with the --severity command. For example, "contrast scan --fail --severity high". Returns all failures if no severity level is specified.',
    constantsLanguage:
      'Valid values are JAVA, DOTNET, NODE, PYTHON and RUBY. If there are multiple project configuration files in the project_path, language is also required.  Also, provide this when cataloguing an application',
    constantsFilePath: `Specify a directory or the file where dependencies are declared. (By default, CodeSec will search for project files in the current directory.)`,
    constantsSilent: 'Silences JSON output.',
    constantsAppGroups:
      'Assign your application to one or more pre-existing groups when using the catalogue command. Group lists should be comma separated.',
    constantsVersion: 'Displays CLI Version you are currently on.',
    constantsProxyServer:
      'Allows for connection via a proxy server. If authentication is required please provide the username and password with the protocol, host and port. For instance: "http://username:password@<host>:<port>".',
    constantsHelp: 'Display this usage guide.',
    constantsGradleMultiProject:
      'Specify the sub project within your gradle application.',
    constantsScan: 'Upload java binaries to the static scan service',
    constantsWaitForScan: 'Waits for the result of the scan',
    constantsProjectName:
      'Contrast project name. If not specified, Contrast uses contrast.settings to identify the project or creates a project.',
    constantsProjectId:
      'The ID associated with a scan project. Replace <ProjectID> with the ID for the scan project. To find the ID, select a scan project in Contrast and locate the last number in the URL.',
    constantsReport: 'Display vulnerability information for this application',
    constantsFail:
      'Set the process to fail if this option is set in combination with --cve_severity.',
    failThresholdOptionErrorMessage: 'More than 0 vulnerabilities found',
    failSeverityOptionErrorMessage:
      ' FAIL - Results detected vulnerabilities over accepted severity level',
    constantsSeverity:
      'Use with "contrast scan --fail --severity high" or "contrast audit --fail --severity high". Set the severity level to detect vulnerabilities or dependencies. Severity levels are critical, high, medium, low or note.',
    constantsCount: 'The number of CVEs that must be exceeded to fail a build',
    constantsHeader: 'CodeSec by Contrast Security',
    configHeader2: 'Config options',
    clearHeader: '-c, --clear',
    clearContent: 'Removes stored credentials',
    constantsPrerequisitesContentScanLanguages:
      'Java, Javascript and .NET supported',
    constantsContrastContent:
      'Use the ‘contrast’ command for fast and accurate security analysis of your applications, APIs, serverless functions, and libraries.',
    constantsContrastCategories:
      '\n Code: Java, .NET, .NET Core, JavaScript\n Serverless: AWS Lambda - Java, Python\n Libraries: Java, .NET, Node, Ruby, Python, Go, PHP\n',
    constantsUsageGuideContentRecommendation:
      'Our recommendation is that this is invoked as part of a CI pipeline so that running the cli is automated as part of your build process.',
    constantsPrerequisitesHeader: 'Pre-requisites',
    constantsAuthUsageHeader: 'Usage',
    constantsAuthUsageContents: 'contrast auth',
    constantsAuthHeaderContents:
      'Authorize with external identity provider to perform scans on code',
    configHeader: 'Config',
    constantsConfigUsageContents: 'view / clear the configuration',
    constantsPrerequisitesContent:
      'To scan a Java project you will need a .jar or .war file for analysis\n' +
      'To scan a Javascript project you will need a single .js or a .zip of  multiple .js files\n' +
      'To scan a .NET c# webforms project you will need a .exe or a .zip file for analysis\n',
    constantsUsage: 'Usage',
    constantsUsageCommandExample: 'contrast [command] [options]',
    constantsUsageCommandInfo:
      'The file argument is optional. If no file is given, Contrast will search for a .jar, .war, .exe or .zip file in the working directory.\n',
    constantsUsageCommandInfo24Hours:
      'Submitted files are encrypted during upload and deleted in 24 hours.',
    constantsAnd: 'AND',
    constantsJava:
      'AND Maven build platform, including the dependency plugin. For a Gradle project, use build.gradle. A gradle-wrapper.properties file is also required. Kotlin is also supported requiring a build.gradle.kts file.',
    constantsJavaNote:
      'Note: Running "mvn dependency:tree" or "./gradlew dependencies" in the project directory locally must be successful.',
    constantsJavaNoteGradle:
      'We currently support v4.8 and upwards on Gradle projects',
    constantsDotNet:
      'MSBuild 15.0 or greater and have a packages.lock.json file are supported.',
    constantsDotNetNote:
      'Please Note: If the packages.lock.json file is not in place it can be generated by setting RestorePackagesWithLockFile to true within each *.csproj and running dotnet build',
    constantsNode: '%s AND a lock file either %s or %s',
    constantsRuby: 'gemfile AND gemfile.lock',
    constantsPython: 'pipfile AND pipfile.lock',
    constantsHowToRunHeader: 'How to run:',
    constantsHowToRunDev1:
      'Begin with contrast auth to authenticate the CLI to perform actions',
    constantsHowToRunDev2:
      'After successful auth try the following command: contrast scan -f "<file>"',
    constantsHowToRunDev3:
      'Allowable languages are java (.jar and .war) and javascript (.js or .zip), if the language is not autodetected please use --language to specify',
    constantsHowToRunContent1:
      'You can run the tool on the command line and manually add the parameters, or you can put the parameters in a YAML file.',
    constantsHowToRunContent2:
      'If you are assessing an application that has not been instrumented by a Contrast agent you must first use the tool to register the application (Catalogue command). This will give you an application ID that you can then use in the Run Command.',
    constantsHowToRunContent3:
      'Allowable language values are JAVA, NODE, PYTHON, RUBY and GO.',
    constantsManualInputHeader: 'Manual Input of Command:',
    constantsManualInputCatalogue: 'Catalogue Command:',
    constantsManualInputCatalogueInstruction:
      'To analyse a new application not already instrumented by Contrast, run the following command:',
    constantsManualInputCatalogueRun:
      'After you run this command, you are provided a new application ID in the console. Use this ID in the Run command:',
    constantsManualInputCatalogueRunTitle: 'Run Command:',
    constantsManualInputCatalogueRunInstruction:
      'To analyse an application catalogued by Contrast, run the following command:',
    constantsYaml: 'Yaml:',
    constantsYamlRunCommand:
      'After you catalogue your application go to Run Command above.',
    constantsOptions: 'Options',
    constantsCatalogueCommand:
      '%s YourApiKey %s YourAuthorizationKey %s YourOrganizationId %s YourHost %s YourApplicationName %s YourApplicationLanguage',
    constantsRunCommand:
      '%s YourApiKey %s YourAuthorizationKey %s YourOrganizationId %s YourHost %s YourApplicationId',
    constantsSpecialCharacterWarning:
      'Please Note: Parameters may need to be quoted to avoid issues with special characters.',
    yamlCatalogueCommand: '%s PathToYaml',
    yamlCommand: '%s PathToYaml',
    agentProxyAndTlsEnabledError:
      'Please Note: We currently do not support having a proxy server and TLS enabled at the same time.',
    TlsHeader: 'TLS',
    TlsBody:
      'To enable TLS please use the YAML file with the following parameters:',
    TlsKey: 'key: pathToKey',
    TlsCert: 'cert: pathToCert',
    TlsCaCert: 'cacert: pathToCaCert',
    goReadProjectFile: 'Failed to read the project file @ "%s" because: "%s"',
    goAnalysisError: 'GO analysis failed because: ',
    goParseProjectFile: 'Failed to parse go mod graph output because: ',
    mavenNotInstalledError:
      "'mvn' is not available. Please ensure you have Maven installed and available on your path.",
    mavenDependencyTreeNonZero:
      'Building maven dependancy tree failed with a non 0 exit code',
    gradleWrapperUnavailable:
      'Gradle wrapper not found in root of project. Please ensure gradlew or gradlew.bat is in root of the project.',
    gradleDependencyTreeNonZero:
      "Building gradle dependancy tree failed with a non 0 exit code. \n Please check you have the correct version of Java installed to compile your project? \n If running against a muti module project ensure you are using the '--sub-project' flag",
    yamlPathCamelCaseError:
      'Warning: The "yamlPath" parameter will be deprecated in a future release. Please look at our documentation for further guidance.',
    constantsSbom:
      'Generate the Software Bill of Materials (SBOM) for the given application',
    constantsMetadata:
      'Define a set of key=value pairs (which conforms to RFC 2253) for specifying user-defined metadata associated with the application.',
    constantsTags:
      'Apply labels to an application. Labels must be formatted as a comma-delimited list. Example - label1,label2,label3',
    constantsCode:
      'Add the application code this application should use in the Contrast UI',
    constantsIgnoreCertErrors:
      'For EOP users with a local Teamserver install, this will bypass the SSL certificate and recognise a self signed certificate.',
    constantsSave: 'Saves the Scan Results SARIF to file.',
    scanLabel:
      "adds a label to the scan - defaults to 'Started by CLI tool at current date'",
    constantsIgnoreDev:
      'Excludes developer dependencies from the results. All dependencies are included by default.',
    constantsCommands: 'Commands',
    constantsScanOptions: 'Scan Options',
    sbomError: 'All required parameters are not present.',
    sbomRetrievalError: 'Unable to retrieve Software Bill of Materials (SBOM)',
    ignoreDevDep: 'No private libraries that are not scoped detected',
    foundExistingProjectScan: 'Found existing project...',
    projectCreatedScan: 'Project created',
    uploadingScan: 'Uploading file to scan.',
    uploadingScanSuccessful: 'Uploaded file successfully.',
    uploadingScanFail: 'Unable to upload the file.',
    waitingTimedOut: 'Timed out.',
    responseMessage: 'Response: %s',
    searchingDirectoryScan: 'Searched 3 directory levels & found: ',
    noFileFoundScan:
      "We couldn't find a suitable file in your directories (we go 3 deep)",
    specifyFileScanError:
      'Java Scan requires a .war or .jar file. Javascript Scan requires a .js or .zip file.\nTo start a Scan enter "contrast scan -f <path-to-file>"',
    specifyFileAuditNotFound: 'No files found for library analysis',
    populateProjectIdMessage: 'project ID is %s',
    genericServiceError: 'returned with status code %s',
    projectIdError: 'Your project ID is %s please check this is correct',
    permissionsError:
      'You do not have the correct permissions here. \n Contact support@contrastsecurity.com to get this fixed.',
    scanErrorFileMessage:
      'We only accept the following file types: \nJava - .jar, .war \nJavaScript - .js or .zip files',
    helpAuthSummary:
      'Authenticate Contrast using your Github or Google account',
    helpAuditSummary:
      'Searches for a suitable file in the working directory to perform a security audit of dependencies and returns the results. [Contrast audit --help (for options).]',
    helpScanSummary:
      'Searches for a .jar, .war, .js, or .zip file in the working directory, uploads files for analysis, and returns the results. [For further help/options, enter scan --help]',
    helpLambdaSummary:
      'Performs a static security scan on an AWS lambda function. lambda --help (for options)',
    helpVersionSummary: 'Displays version of Contrast CLI',
    helpConfigSummary: 'Displays stored credentials',
    helpSummary: 'Displays usage guide',
    authName: 'auth',
    auditName: 'audit',
    scanName: 'scan',
    lambdaName: 'lambda',
    versionName: 'version',
    configName: 'config',
    helpName: 'help',
    scanOptionsLanguageSummary: 'Valid values are JAVA, JAVASCRIPT and DOTNET',
    scanOptionsLanguageSummaryOptional:
      'Language of file to send for analysis. ',
    scanOptionsLanguageSummaryRequired:
      'If you scan a .zip file or you use the --file option.',
    scanOptionsTimeoutSummary:
      'Time in seconds to wait for scan to complete. Default value is 300 seconds.',
    scanOptionsFileNameSummary:
      'Path of the file you want to scan. If no file is specified, Contrast searches for a .jar, .war, .exe or .zip file in the working directory.',
    scanOptionsVerboseSummary: ' Returns extended information to the terminal.',
    authSuccessMessage: 'Authentication successful',
    runAuthSuccessMessage:
      chalk.bold('CodeSec by Contrast') +
      '\nScan, secure and ship your code in minutes for FREE. \n' +
      chalk.bold('\nRun\n') +
      chalk.bold('\ncontrast scan') +
      " to run Contrast's industry leading SAST scanner. \nSupports Java, JavaScript and .Net \n" +
      chalk.bold('\ncontrast audit') +
      ' to find vulnerabilities in your open source dependencies.\nSupports Java, .NET, Node, Ruby, Python, Go and PHP \n' +
      chalk.bold('\ncontrast lambda') +
      ' to secure your AWS serverless functions. \nSupports Java and Python \n' +
      chalk.bold('\ncontrast help') +
      ' to learn more about the capabilities.',
    authWaitingMessage: 'Waiting for auth...',
    authTimedOutMessage: 'Auth Timed out, try again',
    zipErrorScan:
      'We only support zip files for JAVASCRIPT language, please set the flag --language JAVASCRIPT',
    unknownFileErrorScan: 'Unsupported file selected for Scan.',
    foundScanFile: 'Found: %s',
    foundDetailedVulnerabilities:
      chalk.bold('%s') + ' | ' + chalk.bold('%s') + ' | %s | %s | %s ',
    requiredParams: 'All required parameters are not present.',
    timeoutScan: 'Timeout set to 5 minutes.',
    searchingScanFileDirectory: 'Searching for file to scan from %s...',
    searchingAuditFileDirectory:
      'Searching for package manager files from %s...',
    scanHeader: 'Contrast Scan CLI',
    authHeader: 'Auth',
    lambdaHeader: 'Contrast Lambda CLI',
    lambdaSummary:
      'Performs static security scan on an AWS Lambda Function.\nProduces CVE (Vulnerable Dependencies) and Least Privilege violations/remediation results.',
    lambdaUsage: 'contrast lambda --function-name <function> [options]',
    lambdaPrerequisitesContent: '',
    lambdaPrerequisitesContentLambdaLanguages:
      'Supported runtimes: Java & Python',
    lambdaPrerequisitesContentLambdaDescriptionTitle: 'AWS Requirements\n',
    lambdaPrerequisitesContentLambdaDescription:
      'Make sure you have the AWS credentials configured on your local environment. \nYou need the following AWS permissions configured on your IAM user:\n   - Lambda: GetFunction, GetLayerVersion, ListFunctions\n   - IAM: GetRolePolicy, GetPolicy, GetPolicyVersion, ListRolePolicies, ListAttachedRolePolicies',
    scanFileNameOption: '-f, --file',
    lambdaFunctionNameOption: '-f, --function-name',
    lambdaListFunctionsOption: '-l, --list-functions',
    lambdaEndpointOption: '-e, --endpoint-url',
    lambdaRegionOption: '-r, --region',
    lambdaProfileOption: '-p, --profile',
    lambdaJsonOption: '-j, --json-output',
    lambdaVerboseOption: '-v, --verbose',
    lambdaHelpOption: '-h, --help',
    lambdaFunctionNameSummery: 'Name of AWS lambda function to scan.',
    lambdaListFunctionsSummery: 'List all available lambda functions to scan.',
    lambdaEndpointSummery: 'AWS Endpoint override, works like in AWS CLI.',
    lambdaRegionSummery:
      'Region override, default to AWS_DEAFAULT_REGION env var, works like in AWS CLI.',
    lambdaProfileSummery:
      'AWS configuration profile override, works like in AWS CLI.',
    lambdaJsonSummery:
      'Return response in JSON (versus default human readable format).',
    lambdaVerbosSummery: 'Returns extended information to the terminal.',
    configNotFound:
      'Configuration details not found. Try authenticating by using ‘contrast auth’.',
    redirectAuth:
      '\nOpening the authentication page in your web browser.\nSign in and complete the steps.\nReturn here to start using Contrast.\n\nIf your browser has trouble loading, try this:\n%s \n',
    scanZipError:
      'A .zip archive can be used for Javascript Scan. Archive found %s does not contain .JS files for Scan.',
    fileNotExist: 'File specified does not exist, please check and try again.',
    scanFileIsEmpty: 'File specified is empty. Please choose another.',
    fileHasWhiteSpacesError:
      'File cannot have spaces, please rename or choose another file to Scan.',
    zipFileException: 'Error reading zip file',
    connectionError:
      'An error has occurred when trying to get the Project Id please check your internet connection or provide the Project Id manually',
    internalServerErrorHeader: '500 error - Internal server error',
    resourceLockedErrorHeader: '423 error - Resource is locked',
    auditHeader: 'Contrast audit help',
    auditHeaderMessage:
      "Use 'contrast audit' to analyze a project’s dependencies for vulnerabilities.",
    constantsAuditPrerequisitesContentSupportedLanguages:
      'Supported languages and their requirements are:',
    constantsAuditPrerequisitesJavaContentMessage: `
    ${chalk.bold('Java:')} pom.xml ${chalk.bold(
      'and'
    )} Maven build platform including the dependency plugin. 
    ${chalk.bold('Or')} build.gradle ${chalk.bold(
      'and'
    )} gradle dependencies or ./gradlew dependencies must be supported`,
    constantsAuditPrerequisitesContentDotNetMessage: `
    ${chalk.bold(
      '.NET framework and .NET core:'
    )} MSBuild 15.0 or greater and a packages.lock.json file.
    Note: If the packages.lock.json file is unavailable it can be generated by setting RestorePackagesWithLockFile to true within each *.csproj file and running dotnet build.\n`,
    constantsAuditPrerequisitesContentNodeMessage: `${chalk.bold(
      'Node:'
    )} package.json and a lock file (either .package-lock.json or .yarn.lock.)\n`,
    constantsAuditPrerequisitesContentRubyMessage: `${chalk.bold(
      'Ruby:'
    )} gemfile and gemfile.lock\n`,
    constantsAuditPrerequisitesContentPythonMessage: `${chalk.bold(
      'Python:'
    )} pipfile and pipfile.lock\n`,
    constantsAuditPrerequisitesContentGoMessage: `${chalk.bold(
      'Go:'
    )} go.mod\n`,
    constantsAuditPrerequisitesContentPHPMessage: `${chalk.bold(
      'PHP:'
    )} composer.json and composer.lock\n`,
    constantsAuditOptions: 'Audit Options',
    auditOptionsSaveDescription:
      'Generate and save an SBOM (Software Bill of Materials)\n',
    auditOptionsSaveOptionsDescription:
      'Valid options are: --save spdx and --save cyclonedx (CycloneDX is the default format.)',
    exceededFreeTier: `It looks like you are really loving CodeSec! \nYou have reached the monthly scan limit on the FREE tier. \nPlease contact sales@contrastsecurity.com to upgrade.`,
    scanNotCompleted:
      'Scan not completed. Check for framework and language support here: %s',
    auditNotCompleted: 'audit not completed.  Please try again',
    scanNoVulnerabilitiesFound: '🎉 No vulnerabilities found.',
    scanNoVulnerabilitiesFoundSecureCode: '👍 Your code looks secure.',
    scanNoVulnerabilitiesFoundGoodWork: '   Keep up the good work.',
    scanNoFiletypeSpecifiedForSave:
      'Please specify file type to save results to, accepted value is SARIF',
    auditSBOMSaveSuccess:
      '\n Software Bill of Materials (SBOM) saved successfully',
    auditNoFiletypeSpecifiedForSave: `\n ${chalk.yellow.bold(
      'No file type specified for --save option to save audit results to. Use audit --help to see valid --save options.'
    )}`,
    auditBadFiletypeSpecifiedForSave: `\n ${chalk.yellow.bold(
      'Bad file type specified for --save option. Use audit --help to see valid --save options.'
    )}`,
    auditReportWaiting: 'Waiting for report...',
    auditReportFail: 'Report Retrieval Failed, please try again',
    auditReportSuccessMessage: 'Report successfully retrieved',
    auditReportFailureMessage: 'Unable to generate library report',
    auditSCAAnalysisBegins: 'Contrast SCA audit started',
    auditSCAAnalysisComplete: 'Contrast audit complete',
    commonHelpHeader: 'Need More Help?',
    commonHelpCheckOutHeader: chalk.hex('#9DC184')('Check out:'),
    commonHelpCheckOutText: ' https://support.contrastsecurity.com',
    commonHelpLearnMoreHeader: chalk.hex('#9DC184')('Learn more at:'),
    commonHelpLearnMoreText: ' https://developer.contrastsecurity.com',
    commonHelpJoinDiscussionHeader: chalk.hex('#9DC184')(
      'Join the discussion:'
    ),
    commonHelpJoinDiscussionText: ' https://dev.to/codesec',
    ...lambda
  }
}

module.exports = {
  en_locales
}
