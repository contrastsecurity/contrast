const parsedCLIOptions = require('../../utils/parsedCLIOptions')
const constants = require('../../cliConstants')
const commandLineUsage = require('command-line-usage')
const i18n = require('i18n')

const processConfig = async (argv, config) => {
  try {
    let configParams = await parsedCLIOptions.getCommandLineArgsCustom(
      config,
      'config',
      argv,
      constants.commandLineDefinitions.configOptionDefinitions
    )
    if (configParams.help) {
      console.log(configUsageGuide)
      process.exit(0)
    }
    if (configParams.clear) {
      config.clear()
    } else {
      console.log(JSON.parse(JSON.stringify(config.store)))
    }
  } catch (e) {
    //handle unknown command inputs
    console.log(e.message.toString())
  }
}

const configUsageGuide = commandLineUsage([
  {
    header: i18n.__('configHeader')
  },
  {
    content: [i18n.__('constantsConfigUsageContents')],
    optionList: constants.commandLineDefinitions.configOptionDefinitions
  }
])

module.exports = {
  processConfig: processConfig
}
