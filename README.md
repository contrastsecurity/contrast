# Contrast CLI

Scan your AWS Lambda functions and ensure security for policy permissions, dependencies and your code.

This initial release supports both Java and Python functions.

## Getting Started

### Download

You can install using [NPM](https://npmjs.com):

```shell
npm install -g @contrast/contrast
```

[Homebrew](https://brew.sh/):

```shell
brew tap contrastsecurity/homebrew-contrast
brew install contrast
```

or download binaries for [Windows](https://github.com/contrastsecurity/contrast/releases/download/v1.0.0/contrast-1.0.0-windows.zip), [macOS](https://github.com/contrastsecurity/contrast/releases/download/v1.0.0/contrast-1.0.0-macos.tar.gz) and [Linux](https://github.com/contrastsecurity/contrast/releases/download/v1.0.0/contrast-1.0.0-linux.tar.gz).


### Prerequisites

Make sure your AWS credentials are available. The Contrast CLI can find your credentials in one of the following ways:

 * Configured in your user profile (usually located at `~/.aws/credentials`)
 * Using the `--profile` argument when running the CLI
 * Using `AWS_DEFAULT_REGION`, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables

You will also need the following permissions:

 * Lambda: [GetFunction](https://docs.aws.amazon.com/lambda/latest/dg/API_GetFunction.html), [GetLayerVersion](https://docs.aws.amazon.com/lambda/latest/dg/API_GetLayerVersion.html)
 * IAM: [GetRolePolicy](https://docs.aws.amazon.com/IAM/latest/APIReference/API_GetRolePolicy.html), [GetPolicy](https://docs.aws.amazon.com/IAM/latest/APIReference/API_GetPolicy.html), [GetPolicyVersion](https://docs.aws.amazon.com/IAM/latest/APIReference/API_GetPolicyVersion.html), [ListRolePolicies](https://docs.aws.amazon.com/IAM/latest/APIReference/API_ListRolePolicies.html), [ListAttachedRolePolicies](https://docs.aws.amazon.com/IAM/latest/APIReference/API_ListAttachedRolePolicies.html)

#### Example AWS Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "iam:GetPolicyVersion",
                "iam:GetPolicy",
                "lambda:GetLayerVersion",
                "lambda:GetFunction",
                "iam:ListAttachedRolePolicies",
                "iam:ListRolePolicies",
                "iam:GetRolePolicy"
            ],
            "Resource": [
                "arn:aws:lambda:*:YOUR_ACCOUNT:layer:*:*",
                "arn:aws:lambda:*:YOUR_ACCOUNT:function:*",
                "arn:aws:iam::YOUR_ACCOUNT:role/*",
                "arn:aws:iam::YOUR_ACCOUNT:policy/*"
            ]
        }
    ]
}
```

## Running Your First Scan

### Authenticate with Contrast

```
contrast auth
```

### Scan a Lambda Function

```
contrast lambda --function-name <YOUR_FUNCTION_NAME> --region <AWS_REGION>
```

For more help, use the following command:

```
contrast lambda --help
```

## Commands

 * `contrast auth` &ndash; Authenticate using your GitHub or Google account
 * `contrast lambda` &ndash; Perform a scan on an AWS Lambda function
 * `contrast config` &ndash; Display your stored credentials
 * `contrast config --clear` &ndash; Remove your stored credentials
 * `contrast version` &ndash; Display the installed version of the Contrast CLI
 * `contrast help` &ndash; Display help

## Example

```shell
contrast lambda --function-name myFunctionName
contrast lambda -f myFunctionName --region eu-central-1
contrast lambda -f myFunctionName --region eu-central-1 --profile myDevProfile
contrast lambda -f myFunctionName -v -j -r eu-central-1 -p myDevProfile
contrast lambda --function-name myFunctionName --verbose --json-output --region eu-central-1 --profile myDevProfile
```

![image](https://user-images.githubusercontent.com/289035/165555050-e9a709c9-f2a9-4edc-a064-8208445238bc.png)
