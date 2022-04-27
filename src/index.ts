import commandLineArgs from 'command-line-args'
import { processAuth } from './commands/auth/auth'
import { processConfig } from './commands/config/config'
import { processScan } from './commands/scan/processScan'
import constants from './constants'
import { APP_NAME, APP_VERSION } from './constants/constants'
import { processLambda } from './lambda/lambda'
import { localConfig } from './utils/getConfig'

const {
  commandLineDefinitions: { mainUsageGuide, mainDefinition }
} = constants

const config = localConfig(APP_NAME, APP_VERSION)

const getMainOption = () => {
  const mainOptions = commandLineArgs(mainDefinition, {
    stopAtFirstUnknown: true,
    camelCase: true,
    caseInsensitive: true
  })
  const argv = mainOptions._unknown || []

  return {
    mainOptions,
    argv
  }
}

const start = async () => {
  const { mainOptions, argv: argvMain } = getMainOption()
  const command =
    mainOptions.command != undefined ? mainOptions.command.toLowerCase() : ''
  if (command === 'version') {
    console.log(APP_VERSION)
    return
  }

  if (command === 'config') {
    return processConfig(argvMain, config)
  }

  if (command === 'auth') {
    return await processAuth(config)
  }

  if (command === 'lambda') {
    return await processLambda(argvMain)
  }

  /* second - parse the merge command options */
  if (command === 'scan') {
    return await processScan()
  }

  if (
    command === 'help' ||
    argvMain.includes('--help') ||
    Object.keys(mainOptions).length === 0
  ) {
    console.log(mainUsageGuide)
  } else {
    console.log(
      'Unknown Command: ' + command + ' \nUse --help for the full list'
    )
  }
}

start()
