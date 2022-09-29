const commandLineArgs = require('command-line-args')
const { sendTelemetryConfigAsConfObj } = require('../telemetry/telemetry')

const getCommandLineArgsCustom = async (
  contrastConf,
  command,
  parameterList,
  optionDefinitions
) => {
  try {
    return commandLineArgs(optionDefinitions, {
      argv: parameterList,
      partial: false,
      camelCase: true,
      caseInsensitive: true
    })
  } catch (e) {
    await sendTelemetryConfigAsConfObj(
      contrastConf,
      command,
      parameterList,
      'FAILURE',
      'undefined'
    )
    console.log(e.message.toString())
    process.exit(1)
  }
}

module.exports = {
  getCommandLineArgsCustom
}
