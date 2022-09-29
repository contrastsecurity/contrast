export enum StatusType {
  FAILED = 'failed',
  SUCCESS = 'success'
}

export enum EventType {
  START = 'start_command_session',
  END = 'end_command_session'
}

export type LambdaOptions = {
  functionName?: string
  listFunctions?: boolean
  region?: string
  endpointUrl?: string
  profile?: string
  help?: boolean
  verbose?: boolean
  jsonOutput?: boolean
  _unknown?: string[]
}

type ScanFunctionData = {
  functionArn: string
  scanId: string
}

export type AnalyticsOption = {
  sessionId: string
  eventType: EventType
  packageVersion: string
  arguments?: LambdaOptions
  scanFunctionData?: ScanFunctionData
  status?: StatusType
  errorMsg?: string
}
