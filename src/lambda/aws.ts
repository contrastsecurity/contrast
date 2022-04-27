import {
  Lambda,
  GetFunctionCommand,
  GetLayerVersionByArnCommand,
  FunctionConfiguration,
  ResourceNotFoundException,
  LambdaServiceException
} from '@aws-sdk/client-lambda'
import {
  GetRolePolicyCommand,
  IAMClient,
  paginateListRolePolicies,
  paginateListAttachedRolePolicies,
  GetPolicyCommand,
  GetPolicyVersionCommand
} from '@aws-sdk/client-iam'
import { fromIni } from '@aws-sdk/credential-provider-ini'
import { RegionInputConfig } from '@aws-sdk/config-resolver/dist-types/regionConfig/resolveRegionConfig'
import { EndpointsInputConfig } from '@aws-sdk/config-resolver/dist-types/endpointsConfig/resolveEndpointsConfig'
import { AwsAuthInputConfig } from '@aws-sdk/middleware-signing/dist-types/configurations'
import { CliError } from './cliError'
import { LambdaOptions } from './lambda'
import { ERRORS } from './constants'

type AWSClientConfig = RegionInputConfig &
  EndpointsInputConfig &
  AwsAuthInputConfig

const getAwsClientOptions = ({
  region,
  endpointUrl,
  profile
}: LambdaOptions): AWSClientConfig => {
  const credentials = profile ? fromIni({ profile }) : undefined
  return {
    region: region || process.env.AWS_DEFAULT_REGION,
    endpoint: endpointUrl,
    credentials
  }
}

const getLambdaClient = (lambdaOptions: LambdaOptions) => {
  try {
    const clientOptions = getAwsClientOptions(lambdaOptions)
    return new Lambda(clientOptions)
  } catch (error) {
    const errorObj = error as any
    if (errorObj?.code === 'ERR_INVALID_URL') {
      throw new CliError(ERRORS.AWS_ERROR, { description: errorObj.message })
    }

    throw error
  }
}

const getIAMClient = (lambdaOptions: LambdaOptions) => {
  const clientOptions = getAwsClientOptions(lambdaOptions)
  return new IAMClient(clientOptions)
}

const getLambdaFunctionConfiguration = async (
  client: Lambda,
  lambdaOptions: LambdaOptions
) => {
  const { functionName: FunctionName } = lambdaOptions
  const getFunctionCommand = new GetFunctionCommand({ FunctionName })
  try {
    return await client.send(getFunctionCommand)
  } catch (error) {
    throwAwsError(error)
  }
}

const getLayersLinks = async (
  client: Lambda,
  functionConfiguration: FunctionConfiguration
) => {
  const { Layers: layers = [] } = functionConfiguration
  const resultPromises = layers.map(async layerDict => {
    try {
      const layerArn = layerDict.Arn
      const getLayerVersionByArnCommand = new GetLayerVersionByArnCommand({
        Arn: layerArn
      })
      const layer = await client.send(getLayerVersionByArnCommand)
      return {
        Arn: layerArn,
        Location: layer.Content?.Location
      }
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        e.message = `The layer ${layerDict.Arn} could not be found. We will continue the scan without it.`
        throw e
      }
      throw e
    }
  })
  const results = await Promise.allSettled(resultPromises)
  const validLayers = results.filter(layerResult => {
    if (layerResult.status === 'rejected') {
      console.warn(layerResult.reason.message)
      return false
    }
    return true
  })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: value is not recognized
  return validLayers.map(layer => layer.value)
}

const getLambdaPolicies = async (
  functionConfiguration: FunctionConfiguration,
  lambdaOptions: LambdaOptions
) => {
  const { Role: roleArn } = functionConfiguration
  const roleSplitList = roleArn?.split('/')

  if (roleSplitList) {
    const roleName = roleSplitList[roleSplitList.length - 1]
    const client = exports.getIAMClient(lambdaOptions)
    const rolePolicies = await getRolePolicies(roleName, client)
    const attachedPolicies = await getAttachedPolicies(roleName, client)
    return [...rolePolicies, ...attachedPolicies]
  }
}

const getRolePolicyNames = async (roleName: string, client: IAMClient) => {
  const listRolePolicyNames = []

  try {
    for await (const page of paginateListRolePolicies(
      { client },
      { RoleName: roleName }
    )) {
      if (page.PolicyNames) {
        listRolePolicyNames.push(...page.PolicyNames)
      }
    }
  } catch (error) {
    throwAwsError(error)
  }

  return listRolePolicyNames
}

const getAttachedPolicyNames = async (roleName: string, client: IAMClient) => {
  const listAttachedPolicies = []
  for await (const page of paginateListAttachedRolePolicies(
    { client },
    { RoleName: roleName }
  )) {
    if (page.AttachedPolicies) {
      listAttachedPolicies.push(...page.AttachedPolicies)
    }
  }
  return listAttachedPolicies
}

const getRolePolicies = async (roleName: string, client: IAMClient) => {
  const listRolePolicyNames = await exports.getRolePolicyNames(roleName, client)

  if (listRolePolicyNames) {
    const rolePoliciesPromises = listRolePolicyNames.map(
      async (policyName: any) => {
        const getRolePolicyCommand = new GetRolePolicyCommand({
          PolicyName: policyName,
          RoleName: roleName
        })

        const rolePolicy = await client.send(getRolePolicyCommand)
        const policyDoc = JSON.parse(
          decodeURIComponent(rolePolicy?.PolicyDocument || '{}')
        )
        policyDoc.PolicyName = policyName
        return policyDoc
      }
    )

    const rolePolicies = await Promise.all(rolePoliciesPromises)
    return rolePolicies
  }

  return []
}

const getAttachedPolicies = async (roleName: string, client: IAMClient) => {
  const listAttachedPolicies = await exports.getAttachedPolicyNames(
    roleName,
    client
  )
  const attachedPoliciesPromises = listAttachedPolicies.map(
    async (policyDict: { PolicyArn: any; PolicyName: any }) => {
      const getPolicyCommand = new GetPolicyCommand({
        PolicyArn: policyDict.PolicyArn
      })
      const policy = await client.send(getPolicyCommand)
      if (policy.Policy) {
        const getPolicyVersionCommand = new GetPolicyVersionCommand({
          PolicyArn: policy.Policy.Arn,
          VersionId: policy.Policy.DefaultVersionId
        })
        const policyVersion = await client.send(getPolicyVersionCommand)
        const policyDoc = JSON.parse(
          decodeURIComponent(policyVersion?.PolicyVersion?.Document || '{}')
        )
        policyDoc['PolicyName'] = policyDict.PolicyName
        policyDoc['PolicyArn'] = policyDict.PolicyArn
        return policyDoc
      }
    }
  )

  const attachedPolicies = await Promise.all(attachedPoliciesPromises)
  return attachedPolicies
}

/**
 *
 * @param error any error
 * @returns throw AWS error in union format
 */
const throwAwsError = (error: any) => {
  const serviceError = error as LambdaServiceException

  if (error instanceof Error && serviceError.$metadata) {
    const { httpStatusCode } = serviceError.$metadata
    const { message } = error

    throw new CliError(ERRORS.AWS_ERROR, {
      statusCode: httpStatusCode,
      description: message
    })
  }

  throw error
}

export {
  getAttachedPolicyNames,
  getRolePolicyNames,
  getIAMClient,
  getLambdaClient,
  getLambdaFunctionConfiguration,
  getLayersLinks,
  getLambdaPolicies,
  throwAwsError
}
