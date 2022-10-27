import commandLineArgs from 'command-line-args'
import { performance } from 'perf_hooks'
import { kebabCase } from 'lodash'
import i18n from 'i18n'
import { getAuth } from '../utils/paramsUtil/paramHandler'
import { CliError } from './cliError'
import { ERRORS } from './constants'
import { lambdaUsageGuide } from './help'
import { log } from './logUtils'
import { pollScanUntilCompletion } from './scanDetailCompletion'
import { requestScanFunctionPost } from './scanRequest'
import { getScanResults } from './scanResults'
import { printResults } from './utils'
import { getAllLambdas, printAvailableLambdas } from './lambdaUtils'
import { sleep } from '../utils/requestUtils'
import ora from '../utils/oraWrapper'
import { postAnalytics } from './analytics'
import { LambdaOptions, AnalyticsOption, StatusType, EventType } from './types'
import { APP_VERSION } from '../constants/constants'
import { postRunMessage } from '../common/commonHelp'

type ApiParams = {
  organizationId: string
  provider: 'aws'
  accountId: string
}

const failedStates = [
  'UNSUPPORTED',
  'EXCLUDED',
  'CANCELED',
  'FAILED',
  'DISMISSED'
]

const printHelpMessage = () => {
  log(lambdaUsageGuide)
}

const getLambdaOptions = (argv: string[]) => {
  try {
    const lambdaDefinitions = [
      { name: 'function-name', alias: 'f', type: String },
      { name: 'list-functions', alias: 'l', type: Boolean },
      { name: 'region', alias: 'r', type: String },
      { name: 'endpoint-url', alias: 'e', type: String },
      { name: 'profile', alias: 'p', type: String },
      { name: 'help', alias: 'h', type: Boolean },
      { name: 'verbose', alias: 'v', type: Boolean },
      { name: 'json-output', alias: 'j', type: Boolean }
    ]

    const lambdaOptions: LambdaOptions = commandLineArgs(lambdaDefinitions, {
      argv,
      partial: true,
      camelCase: true,
      caseInsensitive: true
    })

    return lambdaOptions
  } catch (error) {
    throw new CliError(ERRORS.VALIDATION_FAILED, {
      description: (error as Error).message
    })
  }
}

const processLambda = async (argv: string[]) => {
  let errorMsg
  let scanInfo: { functionArn: string; scanId: string } | undefined
  const commandSessionId = Date.now().toString(36)
  try {
    const lambdaOptions = getLambdaOptions(argv)
    const { help } = lambdaOptions
    const startCommandAnalytics: AnalyticsOption = {
      arguments: lambdaOptions,
      sessionId: commandSessionId,
      eventType: EventType.START,
      packageVersion: APP_VERSION
    }
    postAnalytics(startCommandAnalytics).catch((error: Error) => {
      /* ignore */
    })
    if (help) {
      return handleLambdaHelp()
    }

    validateRequiredLambdaParams(lambdaOptions)

    if (lambdaOptions.listFunctions) {
      await getAvailableFunctions(lambdaOptions)
    } else {
      scanInfo = await actualProcessLambda(lambdaOptions)
    }
  } catch (error) {
    if (error instanceof CliError) {
      errorMsg = error.getErrorMessage()
    } else if (error instanceof Error) {
      errorMsg = error.message
    }
  } finally {
    const endCommandAnalytics: AnalyticsOption = {
      sessionId: commandSessionId,
      eventType: EventType.END,
      status: errorMsg ? StatusType.FAILED : StatusType.SUCCESS,
      packageVersion: APP_VERSION
    }
    if (errorMsg) {
      endCommandAnalytics.errorMsg = errorMsg
      console.error(errorMsg)
    }
    if (scanInfo) {
      endCommandAnalytics.scanFunctionData = scanInfo
    }
    await postAnalytics(endCommandAnalytics).catch((error: Error) => {
      /* ignore */
    })

    postRunMessage('lambda')

    if (errorMsg) {
      process.exit(1)
    }
  }
}

const getAvailableFunctions = async (lambdaOptions: LambdaOptions) => {
  const lambdas = await getAllLambdas(lambdaOptions)
  printAvailableLambdas(lambdas, { runtimes: ['python', 'java', 'node'] })
}

const actualProcessLambda = async (lambdaOptions: LambdaOptions) => {
  const auth = getAuth()
  const startTime = performance.now()
  const { jsonOutput } = lambdaOptions
  const { scanId, params, functionArn } = await requestScanFunctionPost(
    auth,
    lambdaOptions
  )
  const scans = await pollScanUntilCompletion(auth, 10, params, scanId)
  const failedScan = scans
    ?.filter((s: any) => s.scanType === 2)
    .find((s: any) => failedStates.includes(s.state))

  if (failedScan) {
    throw new CliError(ERRORS.FAILED_TO_GET_SCAN, {
      statusCode: 200,
      errorCode: failedScan.state,
      description: failedScan.stateReasonText
    })
  }

  // Wait to make sure we will have all the results
  const startGetherResultsSpinner = ora.returnOra(i18n.__('gatherResults'))
  ora.startSpinner(startGetherResultsSpinner)
  await sleep(15 * 1000)
  ora.succeedSpinner(startGetherResultsSpinner, 'Done gathering results')

  const resultsResponse = await getScanResults(
    auth,
    params,
    scanId,
    functionArn
  )

  if (jsonOutput) {
    console.log(JSON.stringify(resultsResponse?.data?.results, null, 2))
    return
  }

  const results = resultsResponse?.data?.results
  if (!results) {
    throw new CliError(ERRORS.FAILED_TO_GET_RESULTS, {
      errorCode: 'missingResults'
    })
  }

  if (!results.length) {
    log('👏 No vulnerabilities found')
  }

  const endTime = performance.now()
  const scanDurationMs = endTime - startTime

  log(`----- Scan completed ${(scanDurationMs / 1000).toFixed(2)}s -----`)

  if (results?.length) {
    printResults(results)
  }

  return { functionArn, scanId }
}

const validateRequiredLambdaParams = (options: LambdaOptions) => {
  if (options._unknown?.length) {
    throw new CliError(ERRORS.VALIDATION_FAILED, {
      description: i18n.__('notSupportedFlags', {
        flags: options._unknown.join('\n')
      })
    })
  }

  if (!options?.functionName && !options?.listFunctions) {
    throw new CliError(ERRORS.VALIDATION_FAILED, {
      errorCode: 'missingFunctionName'
    })
  }

  const flagsWithoutValues = Object.entries(options)
    .filter(([, value]) => !value)
    .map(([key]) => key)
    .map(p => `--${kebabCase(p)}`)

  if (flagsWithoutValues.length) {
    throw new CliError(ERRORS.VALIDATION_FAILED, {
      description: i18n.__('missingFlagArguments', {
        flags: flagsWithoutValues.join('\n')
      })
    })
  }
}

const handleLambdaHelp = () => {
  printHelpMessage()
  process.exit(0)
}

export { processLambda, LambdaOptions, ApiParams, getAvailableFunctions }
