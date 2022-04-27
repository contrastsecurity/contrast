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
import { prettyPrintResults } from './utils'

type LambdaOptions = {
  functionName?: string
  region?: string
  endpointUrl?: string
  profile?: string
  help?: boolean
  verbose?: boolean
  jsonOutput?: boolean
  _unknown?: string[]
}

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
  const lambdaDefinitions = [
    { name: 'function-name', alias: 'f', type: String },
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
}

const processLambda = async (argv: string[]) => {
  const lambdaOptions = getLambdaOptions(argv)
  const { help } = lambdaOptions

  if (help) {
    return handleLambdaHelp()
  }

  try {
    validateRequiredLambdaParams(lambdaOptions)

    await actualProcessLambda(lambdaOptions)
  } catch (error) {
    if (error instanceof CliError) {
      console.error(error.getErrorMessage())
    } else if (error instanceof Error) {
      console.error(error.message)
    }
    process.exit(1)
  }
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
    prettyPrintResults(results)
  }
}

const validateRequiredLambdaParams = (options: LambdaOptions) => {
  if (options._unknown?.length) {
    throw new CliError(ERRORS.VALIDATION_FAILED, {
      description: i18n.__('notSupportedFlags', options._unknown.join('\n'))
    })
  }

  if (!options?.functionName) {
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
      description: i18n.__(
        'missingFlagArguments',
        flagsWithoutValues.join('\n')
      )
    })
  }
}

const handleLambdaHelp = () => {
  printHelpMessage()
  process.exit(0)
}

export { processLambda, LambdaOptions, ApiParams }
