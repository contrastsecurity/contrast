import { sleep } from '../utils/requestUtils'
import { getHttpClient } from '../utils/commonApi'
import { ApiParams } from './lambda'
import HTTPClient from '../common/HTTPClient'
import ora from '../utils/oraWrapper'
import { CliError } from './cliError'
import { ERRORS } from './constants'
import { ContrastConf } from '../utils/getConfig'

const MS_IN_MINUTE = 1000 * 60

const getScanResources = async (
  config: ContrastConf,
  params: ApiParams,
  scanId: string,
  httpClient: HTTPClient
) => {
  const res = await httpClient.getScanResources(config, params, scanId)
  const { statusCode, body } = res

  if (statusCode === 200) {
    return res
  }

  const { errorCode } = body || {}
  throw new CliError(ERRORS.FAILED_TO_GET_SCAN, { statusCode, errorCode })
}

const pollScanUntilCompletion = async (
  config: any,
  timeoutInMinutes: number,
  params: ApiParams,
  scanId: string
) => {
  const client = getHttpClient(config)

  const activeStatuses = ['PENDING', 'SCANNING', 'QUEUED']
  const startedText = 'Scan started'
  const maxEndTime = new Date().getTime() + timeoutInMinutes * MS_IN_MINUTE
  const startScanSpinner = ora.returnOra(startedText)
  ora.startSpinner(startScanSpinner)

  await sleep(5000) // wait 5 sec before first polling

  let complete = false
  while (!complete) {
    try {
      const result = await exports.getScanResources(
        config,
        params,
        scanId,
        client
      )
      const { resources: scans } = result.body.data
      const staticScans = scans?.filter((s: any) => s.scanType === 2)
      complete = staticScans.some((s: any) => !activeStatuses.includes(s.state))

      if (complete) {
        ora.succeedSpinner(startScanSpinner, 'Scan Finished')
        return scans
      }

      await sleep(2 * 1000)
    } catch (error) {
      ora.failSpinner(startScanSpinner, 'Scan Failed')
      throw error
    }

    if (Date.now() >= maxEndTime) {
      ora.failSpinner(startScanSpinner, 'Scan timed out')
      throw new CliError(ERRORS.FAILED_TO_GET_SCAN, {
        errorCode: 'waitingTimedOut'
      })
    }
  }
}

export { pollScanUntilCompletion, getScanResources }
