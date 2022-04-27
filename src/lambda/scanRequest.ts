import i18n from 'i18n'
import logSymbols from 'log-symbols'
import chalk from 'chalk'
import { parseARN } from './arn'
import {
  getLambdaClient,
  getLambdaFunctionConfiguration,
  getLambdaPolicies,
  getLayersLinks
} from './aws'
import { toLowerKeys } from './utils'
import { getHttpClient } from '../utils/commonApi'
import { ApiParams, LambdaOptions } from './lambda'
import { log, prettyPrintJson } from './logUtils'
import { CliError } from './cliError'
import { ERRORS } from './constants'

const sendScanPostRequest = async (
  config: any,
  params: ApiParams,
  functionsEvent: unknown,
  showProgress = false
) => {
  const client = getHttpClient(config)

  if (showProgress) {
    // prettier-ignore
    log(`${logSymbols.success} Sending Lambda Function scan request to Contrast`)
  }

  const res = await client.postFunctionScan(config, params, functionsEvent)
  const { statusCode, body } = res

  if (statusCode === 201) {
    if (showProgress) {
      log(`${logSymbols.success} Scan requested successfully`)
    }

    return body?.data?.scanId
  }

  let { errorCode } = body?.data || {}
  const { data } = body?.data || {}

  let description = ''
  switch (errorCode) {
    case 'not_supported_runtime':
      description = i18n.__(
        errorCode,
        data?.runtime,
        data?.supportedRuntimes.sort().join(' | ')
      )
      errorCode = false
      break
  }

  throw new CliError(ERRORS.FAILED_TO_START_SCAN, {
    statusCode,
    errorCode,
    data,
    description
  })
}

const createFunctionEvent = (
  lambdaConfig: any,
  layersLinks: any,
  lambdaPolicies: any
) => {
  delete lambdaConfig.$metadata

  const functionEvent = toLowerKeys(lambdaConfig.Configuration)
  functionEvent['code'] = lambdaConfig.Code
  functionEvent['rolePolicies'] = lambdaPolicies

  if (layersLinks) {
    functionEvent['layers'] = layersLinks
  }

  return { function: functionEvent }
}

const requestScanFunctionPost = async (
  config: any,
  lambdaOptions: LambdaOptions
) => {
  const { verbose, jsonOutput, functionName } = lambdaOptions
  const lambdaClient = getLambdaClient(lambdaOptions)

  if (!jsonOutput) {
    // prettier-ignore
    log(`${logSymbols.success} Fetching configuration and policies for Lambda Function ${chalk.bold(functionName)}`)
  }

  const lambdaConfig = await getLambdaFunctionConfiguration(
    lambdaClient,
    lambdaOptions
  )
  if (!lambdaConfig?.Configuration) {
    throw new CliError(ERRORS.FAILED_TO_START_SCAN, {
      errorCode: 'missingLambdaConfig'
    })
  }
  const { Configuration } = lambdaConfig
  const layersLinks = await getLayersLinks(lambdaClient, Configuration)
  const lambdaPolicies = await getLambdaPolicies(Configuration, lambdaOptions)

  const functionEvent = createFunctionEvent(
    lambdaConfig,
    layersLinks,
    lambdaPolicies
  )
  const { FunctionArn: functionArn } = Configuration
  if (!functionArn) {
    throw new CliError(ERRORS.FAILED_TO_START_SCAN, {
      errorCode: 'missingLambdaArn'
    })
  }

  const parsedARN = parseARN(functionArn)
  const params: ApiParams = {
    organizationId: config.organizationId,
    provider: 'aws',
    accountId: parsedARN.accountId
  }

  if (verbose) {
    log(`${logSymbols.success} Fetched configuration from AWS:`)
    prettyPrintJson(functionEvent)
  }

  const scanId = await sendScanPostRequest(
    config,
    params,
    functionEvent,
    !jsonOutput
  )

  return { scanId, params, functionArn }
}

export { sendScanPostRequest, requestScanFunctionPost, createFunctionEvent }
