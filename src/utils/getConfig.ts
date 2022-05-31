import Conf from 'conf'

type ContrastConfOptions = Partial<{
  version: string
  host: string
  apiKey: string
  orgId: string
  authHeader: string
  numOfRuns: number
}>

type ContrastConf = Conf<ContrastConfOptions>

const localConfig = (name: string, version: string) => {
  const config: ContrastConf = new Conf<ContrastConfOptions>({
    configName: name
  })
  config.set('version', version)

  if (!config.has('host')) {
    config.set('host', 'https://ce.contrastsecurity.com/')
  }
  return config
}

const createConfigFromYaml = (yamlPath: string) => {
  const yamlConfig = {}
  return yamlConfig
}

const setConfigValues = (config: ContrastConf, values: ContrastConfOptions) => {
  config.set('apiKey', values.apiKey)
  config.set('organizationId', values.orgId)
  config.set('authorization', values.authHeader)
  values.host ? config.set('host', values.host) : null
}

export {
  localConfig,
  createConfigFromYaml,
  setConfigValues,
  ContrastConf,
  ContrastConfOptions
}
