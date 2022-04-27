import { Lambda, FunctionConfiguration } from '@aws-sdk/client-lambda'
import { LambdaOptions } from '../lambda'
import lambdaConfig from './lambdaConfig.json'

const getLambdaClient = (lambdaOptions: LambdaOptions) => {
  return {}
}

const getLambdaFunctionConfiguration = async (
  client: Lambda,
  lambdaOptions: LambdaOptions
) => {
  return Promise.resolve(lambdaConfig)
}

const getLayersLinks = async (
  client: Lambda,
  functionConfiguration: FunctionConfiguration
) => {
  return []
}
const getLambdaPolicies = async (
  functionConfiguration: FunctionConfiguration,
  lambdaOptions: LambdaOptions
) => []

export {
  getLambdaClient,
  getLambdaFunctionConfiguration,
  getLayersLinks,
  getLambdaPolicies
}
