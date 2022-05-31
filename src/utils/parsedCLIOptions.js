const commandLineArgs = require('command-line-args')

const getCommandLineArgsCustom = (parameterList, optionDefinitions) => {
  try {
    return commandLineArgs(optionDefinitions, {
      argv: parameterList,
      partial: false,
      camelCase: true,
      caseInsensitive: true
    })
  } catch (e) {
    console.log(e.message.toString())
    process.exit(1)
  }
}

module.exports = {
  getCommandLineArgsCustom
}
