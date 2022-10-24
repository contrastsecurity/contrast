import Conf from 'conf'
import { CE_URL } from '../constants/constants'

type ContrastConfOptions = Partial<{
  version: string
  host: string
  apiKey: string
  orgId: string
  authHeader: string
  numOfRuns: number
  javaAgreement: boolean
}>

type ContrastConf = Conf<ContrastConfOptions>

const localConfig = (name: string, version: string) => {
  const config: ContrastConf = new Conf<ContrastConfOptions>({
    configName: name
  })
  config.set('version', version)

  if (!config.has('host')) {
    config.set('host', CE_URL)
  }
  return config
}

const setConfigValues = (config: ContrastConf, values: ContrastConfOptions) => {
  config.set('apiKey', values.apiKey)
  config.set('organizationId', values.orgId)
  config.set('authorization', values.authHeader)
  values.host ? config.set('host', values.host) : null
}

export { localConfig, setConfigValues, ContrastConf, ContrastConfOptions }
