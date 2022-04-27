"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwAwsError = exports.getLambdaPolicies = exports.getLayersLinks = exports.getLambdaFunctionConfiguration = exports.getLambdaClient = exports.getIAMClient = exports.getRolePolicyNames = exports.getAttachedPolicyNames = void 0;
const client_lambda_1 = require("@aws-sdk/client-lambda");
const client_iam_1 = require("@aws-sdk/client-iam");
const credential_provider_ini_1 = require("@aws-sdk/credential-provider-ini");
const cliError_1 = require("./cliError");
const constants_1 = require("./constants");
const getAwsClientOptions = ({ region, endpointUrl, profile }) => {
    const credentials = profile ? (0, credential_provider_ini_1.fromIni)({ profile }) : undefined;
    return {
        region: region || process.env.AWS_DEFAULT_REGION,
        endpoint: endpointUrl,
        credentials
    };
};
const getLambdaClient = (lambdaOptions) => {
    try {
        const clientOptions = getAwsClientOptions(lambdaOptions);
        return new client_lambda_1.Lambda(clientOptions);
    }
    catch (error) {
        const errorObj = error;
        if (errorObj?.code === 'ERR_INVALID_URL') {
            throw new cliError_1.CliError(constants_1.ERRORS.AWS_ERROR, { description: errorObj.message });
        }
        throw error;
    }
};
exports.getLambdaClient = getLambdaClient;
const getIAMClient = (lambdaOptions) => {
    const clientOptions = getAwsClientOptions(lambdaOptions);
    return new client_iam_1.IAMClient(clientOptions);
};
exports.getIAMClient = getIAMClient;
const getLambdaFunctionConfiguration = async (client, lambdaOptions) => {
    const { functionName: FunctionName } = lambdaOptions;
    const getFunctionCommand = new client_lambda_1.GetFunctionCommand({ FunctionName });
    try {
        return await client.send(getFunctionCommand);
    }
    catch (error) {
        throwAwsError(error);
    }
};
exports.getLambdaFunctionConfiguration = getLambdaFunctionConfiguration;
const getLayersLinks = async (client, functionConfiguration) => {
    const { Layers: layers = [] } = functionConfiguration;
    const resultPromises = layers.map(async (layerDict) => {
        try {
            const layerArn = layerDict.Arn;
            const getLayerVersionByArnCommand = new client_lambda_1.GetLayerVersionByArnCommand({
                Arn: layerArn
            });
            const layer = await client.send(getLayerVersionByArnCommand);
            return {
                Arn: layerArn,
                Location: layer.Content?.Location
            };
        }
        catch (e) {
            if (e instanceof client_lambda_1.ResourceNotFoundException) {
                e.message = `The layer ${layerDict.Arn} could not be found. We will continue the scan without it.`;
                throw e;
            }
            throw e;
        }
    });
    const results = await Promise.allSettled(resultPromises);
    const validLayers = results.filter(layerResult => {
        if (layerResult.status === 'rejected') {
            console.warn(layerResult.reason.message);
            return false;
        }
        return true;
    });
    return validLayers.map(layer => layer.value);
};
exports.getLayersLinks = getLayersLinks;
const getLambdaPolicies = async (functionConfiguration, lambdaOptions) => {
    const { Role: roleArn } = functionConfiguration;
    const roleSplitList = roleArn?.split('/');
    if (roleSplitList) {
        const roleName = roleSplitList[roleSplitList.length - 1];
        const client = exports.getIAMClient(lambdaOptions);
        const rolePolicies = await getRolePolicies(roleName, client);
        const attachedPolicies = await getAttachedPolicies(roleName, client);
        return [...rolePolicies, ...attachedPolicies];
    }
};
exports.getLambdaPolicies = getLambdaPolicies;
const getRolePolicyNames = async (roleName, client) => {
    const listRolePolicyNames = [];
    try {
        for await (const page of (0, client_iam_1.paginateListRolePolicies)({ client }, { RoleName: roleName })) {
            if (page.PolicyNames) {
                listRolePolicyNames.push(...page.PolicyNames);
            }
        }
    }
    catch (error) {
        throwAwsError(error);
    }
    return listRolePolicyNames;
};
exports.getRolePolicyNames = getRolePolicyNames;
const getAttachedPolicyNames = async (roleName, client) => {
    const listAttachedPolicies = [];
    for await (const page of (0, client_iam_1.paginateListAttachedRolePolicies)({ client }, { RoleName: roleName })) {
        if (page.AttachedPolicies) {
            listAttachedPolicies.push(...page.AttachedPolicies);
        }
    }
    return listAttachedPolicies;
};
exports.getAttachedPolicyNames = getAttachedPolicyNames;
const getRolePolicies = async (roleName, client) => {
    const listRolePolicyNames = await exports.getRolePolicyNames(roleName, client);
    if (listRolePolicyNames) {
        const rolePoliciesPromises = listRolePolicyNames.map(async (policyName) => {
            const getRolePolicyCommand = new client_iam_1.GetRolePolicyCommand({
                PolicyName: policyName,
                RoleName: roleName
            });
            const rolePolicy = await client.send(getRolePolicyCommand);
            const policyDoc = JSON.parse(decodeURIComponent(rolePolicy?.PolicyDocument || '{}'));
            policyDoc.PolicyName = policyName;
            return policyDoc;
        });
        const rolePolicies = await Promise.all(rolePoliciesPromises);
        return rolePolicies;
    }
    return [];
};
const getAttachedPolicies = async (roleName, client) => {
    const listAttachedPolicies = await exports.getAttachedPolicyNames(roleName, client);
    const attachedPoliciesPromises = listAttachedPolicies.map(async (policyDict) => {
        const getPolicyCommand = new client_iam_1.GetPolicyCommand({
            PolicyArn: policyDict.PolicyArn
        });
        const policy = await client.send(getPolicyCommand);
        if (policy.Policy) {
            const getPolicyVersionCommand = new client_iam_1.GetPolicyVersionCommand({
                PolicyArn: policy.Policy.Arn,
                VersionId: policy.Policy.DefaultVersionId
            });
            const policyVersion = await client.send(getPolicyVersionCommand);
            const policyDoc = JSON.parse(decodeURIComponent(policyVersion?.PolicyVersion?.Document || '{}'));
            policyDoc['PolicyName'] = policyDict.PolicyName;
            policyDoc['PolicyArn'] = policyDict.PolicyArn;
            return policyDoc;
        }
    });
    const attachedPolicies = await Promise.all(attachedPoliciesPromises);
    return attachedPolicies;
};
const throwAwsError = (error) => {
    const serviceError = error;
    if (error instanceof Error && serviceError.$metadata) {
        const { httpStatusCode } = serviceError.$metadata;
        const { message } = error;
        throw new cliError_1.CliError(constants_1.ERRORS.AWS_ERROR, {
            statusCode: httpStatusCode,
            description: message
        });
    }
    throw error;
};
exports.throwAwsError = throwAwsError;
