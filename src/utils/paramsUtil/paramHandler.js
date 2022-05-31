const commandlineAuth = require('./commandlineParams')
const configStoreParams = require('./configStoreParams')
const envVariableParams = require('./envVariableParams')
const { validateAuthParams } = require('../validationCheck')
const i18n = require('i18n')

const getAuth = params => {
  let commandLineAuthParamsAuth = commandlineAuth.getAuth(params)
  let envVariableParamsAuth = envVariableParams.getAuth()
  let configStoreParamsAuth = configStoreParams.getAuth()

  if (validateAuthParams(commandLineAuthParamsAuth)) {
    return commandLineAuthParamsAuth
  } else if (validateAuthParams(envVariableParamsAuth)) {
    return envVariableParamsAuth
  } else if (validateAuthParams(configStoreParamsAuth)) {
    return configStoreParamsAuth
  } else {
    console.log(i18n.__('configNotFound'))
    process.exit(1)
  }
}

module.exports = { getAuth: getAuth }
