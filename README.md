# Contrast CLI

Install Contrast, authenticate, and then start running a Lambda scan.
This version supports **Java** and **Python** functions on AWS.

## Requirements

- AWS credentials should be **available** on your local configure (usually `~/.aws/credentials`)
- You have an option run lambda scan with your aws-profile to pass `--profile`
- You also can export differnt credentials

```shell
export AWS_DEFAULT_REGION=<YOUR_AWS_REGION>
export AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
export AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
```

These permissions are required to gather all required information on an AWS Lambda to use the `contrast lambda` command:

- Lambda: [GetFunction](https://docs.aws.amazon.com/lambda/latest/dg/API_GetFunction.html), [GetLayerVersion](https://docs.aws.amazon.com/lambda/latest/dg/API_GetLayerVersion.html)
- IAM: [GetRolePolicy](https://docs.aws.amazon.com/IAM/latest/APIReference/API_GetRolePolicy.html), [GetPolicy](https://docs.aws.amazon.com/IAM/latest/APIReference/API_GetPolicy.html), [GetPolicyVersion](https://docs.aws.amazon.com/IAM/latest/APIReference/API_GetPolicyVersion.html), [ListRolePolicies](https://docs.aws.amazon.com/IAM/latest/APIReference/API_ListRolePolicies.html), [ListAttachedRolePolicies](https://docs.aws.amazon.com/IAM/latest/APIReference/API_ListAttachedRolePolicies.html)

Policy example:
```
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

## Installation via Homebrew

- `brew tap Contrast-Security-OSS/homebrew-contrast`
- `brew install contrast`

### Install NPM / YARN

- `npm i -g @contrast/contrast`
- `yarn global add @contrast/contrast`

### Install with binaries

- Go to [https://pkg.contrastsecurity.com/ui/repos/tree/General/cli](https://pkg.contrastsecurity.com/ui/repos/tree/General/cli)
- Select your operating system and download the package
- You must allow **execute permissions** on the file depending on your OS

| Architecture | Link                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| macOS        | [https://pkg.contrastsecurity.com/ui/repos/tree/General/cli/1.0.0/mac/contrast](https://pkg.contrastsecurity.com/ui/repos/tree/General/cli/1.0.0/mac/contrast)                 |
| Linux        | [https://pkg.contrastsecurity.com/ui/repos/tree/General/cli/1.0.0/linux/contrast](https://pkg.contrastsecurity.com/ui/repos/tree/General/cli/1.0.0/linux/contrast)             |
| Windows      | [https://pkg.contrastsecurity.com/ui/repos/tree/General/cli/1.0.0/windows/contrast.exe](https://pkg.contrastsecurity.com/ui/repos/tree/General/cli/1.0.0/windows/contrast.exe) |

## Usage

- `contrast [command] [option]`
- `contrast lambda --function-name <function> [options]`

## Running a scan on a Lambda function

1. `contrast auth`
   Authenticate by entering contrast auth in the terminal.
   In the resulting browser window, log in and authenticate with your GitHub or Google credentials.
2. `contrast lambda --function-name <YOUR_FUNCTION_NAME> --region <AWS_REGION>`

More infromation

- `contrast lambda --help`

## Commands

- `auth` - Authenticate Contrast using your `Github` or `Google` account
- `lambda` - Perform scan on AWS Lambda function
- `version` - Displays version of Contrast CLI
- `config` - Displays stored credentials (`–c, --clear` - Removes stored credentials)
- `help` - Displays usage guide

## Example of Running

```shell
contrast lambda --function-name myFunctionName
contrast lambda -f myFunctionName --region eu-cental-1
contrast lambda -f myFunctionName --region eu-cental-1 --profile myDevProfile
contrast lambda -f myFunctionName -v -j -r eu-cental-1 -p myDevProfile
contrast lambda --function-name myFunctionName --verbose --json-output --region eu-cental-1 --profile myDevProfile
```

## Example of Results

![image](https://user-images.githubusercontent.com/289035/165555050-e9a709c9-f2a9-4edc-a064-8208445238bc.png)
