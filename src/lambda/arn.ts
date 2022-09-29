import { CliError } from './cliError'
import { ERRORS } from './constants'

type ARN = {
  partition: string
  service: string
  region: string
  accountId: string
  resource: string
  resourceId?: string
}

const ARN_REGEX =
  /arn:(?<partition>[^:\n]*):(?<service>[^:\n]*):(?<region>[^:\n]*):(?<accountId>[^:\n]*):(?<ignore>(?<resource>[^:/\n]*)[:/])?(?<resourceId>.*)/

const parseARN = (arn: string | undefined) => {
  if (!arn) {
    throw new CliError(ERRORS.FAILED_TO_START_SCAN, {
      errorCode: 'failedToParseArn'
    })
  }

  const arnMatch = arn.match(ARN_REGEX)
  if (!arnMatch) {
    throw new CliError(ERRORS.FAILED_TO_START_SCAN, {
      errorCode: 'failedToParseArn'
    })
  }

  return arnMatch.groups as ARN
}

export { parseARN, ARN }
