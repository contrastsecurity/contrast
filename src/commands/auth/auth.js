const { v4: uuidv4 } = require('uuid')
const { setConfigValues } = require('../../utils/getConfig')
const open = require('open')
const commonApi = require('../../utils/commonApi')
const { sleep } = require('../../utils/requestUtils')
const i18n = require('i18n')
const {
  returnOra,
  startSpinner,
  failSpinner,
  succeedSpinner
} = require('../../utils/oraWrapper')
const { TIMEOUT, AUTH_UI_URL } = require('../../constants/constants')
const parsedCLIOptions = require('../../utils/parsedCLIOptions')
const constants = require('../../constants')
const commandLineUsage = require('command-line-usage')

const processAuth = async (argv, config) => {
  let authParams = await parsedCLIOptions.getCommandLineArgsCustom(
    config,
    'auth',
    argv,
    constants.commandLineDefinitions.authOptionDefinitions
  )

  if (authParams.help) {
    console.log(authUsageGuide)
    process.exit(0)
  }

  const token = uuidv4()
  const url = `${AUTH_UI_URL}/?token=${token}`

  console.log(i18n.__('redirectAuth', url))

  try {
    //start a spinner / progress
    await setTimeout(() => {
      open(url)
    }, 0)

    const result = await isAuthComplete(token, TIMEOUT, config)
    if (result) {
      setConfigValues(config, result)
    }
    return
  } finally {
    //spinner stop
  }
}

const isAuthComplete = async (token, timeout, config) => {
  const authSpinner = returnOra(i18n.__('authWaitingMessage'))
  startSpinner(authSpinner)
  const client = commonApi.getHttpClient(config)
  let startTime = new Date()
  let complete = false
  while (!complete) {
    let result = await pollAuthResult(token, client)
    if (result.statusCode === 200) {
      succeedSpinner(authSpinner, i18n.__('authSuccessMessage'))
      console.log(i18n.__('runAuthSuccessMessage'))
      return result.body
    }
    let endTime = new Date() - startTime
    if (endTime > timeout) {
      failSpinner(authSpinner, i18n.__('authTimedOutMessage'))
      process.exit(1)
      return
    }
  }
}

const pollAuthResult = async (token, client) => {
  await sleep(5000)
  return client
    .pollForAuth(token)
    .then(res => {
      return res
    })
    .catch(err => {
      console.log(err)
    })
}

const authUsageGuide = commandLineUsage([
  {
    header: i18n.__('authHeader'),
    content: [i18n.__('constantsAuthHeaderContents')]
  },
  {
    header: i18n.__('constantsAuthUsageHeader'),
    content: [i18n.__('constantsAuthUsageContents')]
  }
])

module.exports = {
  processAuth: processAuth
}
