import { getHttpClient } from '../utils/commonApi'
import { CliError } from './cliError'
import { ERRORS } from './constants'
import { ApiParams } from './lambda'

const getScanResults = async (
  config: any,
  params: ApiParams,
  scanId: string,
  functionArn: string
) => {
  const client = getHttpClient(config)

  const { statusCode, body } = await client.getFunctionScanResults(
    config,
    params,
    scanId,
    functionArn
  )

  if (statusCode === 200) {
    return body
  }

  const { errorCode } = body || {}
  throw new CliError(ERRORS.FAILED_TO_GET_RESULTS, { statusCode, errorCode })
}

export { getScanResults }
