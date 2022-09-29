import { getHttpClient } from '../utils/commonApi'
import * as crypto from 'crypto'
import { ContrastConf } from '../utils/getConfig'

export const TELEMETRY_CLI_COMMANDS_EVENT = 'CLI_COMMANDS'
export const TELEMETRY_CLI_TIME_TO_AUTH_EVENT = 'CLI_TIME_TO_AUTH'

export const sendTelemetryConfigAsConfObj = async (
  config: ContrastConf,
  command: string,
  argv: string[],
  result: string,
  language: string
) => {
  const hostParam = '--host'
  const hostParamAlias = '-h'
  const orgIdParam = '--organization-id'
  const orgIdParamAlias = '-o'
  const authParam = '--authorization'
  const apiKeyParam = '--api-key'

  let configToUse

  if (
    paramExists(argv, hostParam, hostParamAlias) &&
    paramExists(argv, orgIdParam, orgIdParamAlias) &&
    paramExists(argv, authParam, null) &&
    paramExists(argv, apiKeyParam, null)
  ) {
    //if the user has passed the values as params
    configToUse = {
      host: findParamValueFromArgs(argv, hostParam, hostParamAlias),
      organizationId: findParamValueFromArgs(argv, orgIdParam, orgIdParamAlias),
      authorization: findParamValueFromArgs(argv, authParam, null),
      apiKey: findParamValueFromArgs(argv, apiKeyParam, null)
    }
  } else if (
    config &&
    config.get('host') &&
    config.get('organizationId') &&
    config.get('authorization') &&
    config.get('apiKey')
  ) {
    configToUse = {
      host: config.get('host')?.slice(0, -1), //slice off extra / in url, will 404 on teamserver if we don't
      organizationId: config.get('organizationId'),
      authorization: config.get('authorization'),
      apiKey: config.get('apiKey')
    }
  } else {
    //return when unable to get config
    return
  }

  return await sendTelemetryConfigAsObject(
    configToUse,
    command,
    argv,
    result,
    language
  )
}

export const sendTelemetryConfigAsObject = async (
  config: any,
  command: string,
  argv: string[],
  result: string,
  language: string
) => {
  const obfuscatedParams = obfuscateParams(argv)

  const requestBody = {
    event: TELEMETRY_CLI_COMMANDS_EVENT,
    details: {
      ip_address: '',
      account_name: '',
      account_host: '',
      company_domain: '',
      command: `contrast ${command} ${obfuscatedParams}`,
      app_id:
        config && config.applicationId
          ? sha1Base64Value(config.applicationId)
          : 'undefined',
      project_id:
        config && config.projectId
          ? sha1Base64Value(config.projectId)
          : 'undefined',
      language: language,
      result: result,
      additional_info: '',
      timestamp: new Date().toUTCString()
    }
  }

  return await sendTelemetryRequest(config, requestBody)
}

export const sendTelemetryRequest = async (config: any, requestBody: any) => {
  const client = getHttpClient(config)
  return client
    .postTelemetry(config, requestBody)
    .then((res: any) => {
      if (res.statusCode !== 200 && config.debug === true) {
        console.log('Telemetry failed to send with status', res.statusCode)
      }
      return { statusCode: res.statusCode, statusMessage: res.statusMessage }
    })
    .catch((err: any) => {
      return
    })
}

export const obfuscateParams = (argv: string[]) => {
  return argv
    .join(' ')
    .replace(/--(authorization [A-Z0-9]+)/gi, '--authorization *****')
    .replace(/-(o [A-Z0-9-]+)/gi, '-o *****')
    .replace(/--(organization-id [A-Z0-9-]+)/gi, '--organization-id *****')
    .replace(/--(api-key [A-Z0-9]+)/gi, '--api-key *****')
}

export const paramExists = (
  argv: string[],
  param: string,
  paramAlias: string | null
) => {
  return argv.find((arg: string) => arg === param || arg === paramAlias)
}

export const findParamValueFromArgs = (
  argv: string[],
  param: string,
  paramAlias: string | null
) => {
  let paramAsValue

  argv.forEach((arg: string, index: number) => {
    if (
      arg === param ||
      (arg === paramAlias &&
        argv[index + 1] !== undefined &&
        argv[index + 1] !== null)
    ) {
      paramAsValue = argv[index + 1]
    }
  })

  return paramAsValue
}

export const sha1Base64Value = (value: any) => {
  return crypto.createHash('sha1').update(value).digest('base64')
}
