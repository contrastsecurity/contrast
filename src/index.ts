#!/usr/bin/env node

import commandLineArgs from 'command-line-args'
import { processAudit } from './commands/audit/processAudit'
import { processAuth } from './commands/auth/auth'
import { processConfig } from './commands/config/config'
import { processScan } from './commands/scan/processScan'
import constants from './constants'
import { APP_NAME, APP_VERSION } from './constants/constants'
import { processLambda } from './lambda/lambda'
import { localConfig } from './utils/getConfig'
import {
  findLatestCLIVersion,
  isCorrectNodeVersion
} from './common/versionChecker'
import { findCommandOnError } from './common/errorHandling'
import { sendTelemetryConfigAsConfObj } from './telemetry/telemetry'
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
  try {
    if (await isCorrectNodeVersion(process.version)) {
      const { mainOptions, argv: argvMain } = getMainOption()
      const command =
        mainOptions.command != undefined
          ? mainOptions.command.toLowerCase()
          : ''
      if (
        command === 'version' ||
        argvMain.includes('--v') ||
        argvMain.includes('--version')
      ) {
        console.log(APP_VERSION)
        await findLatestCLIVersion(config)
        return
      }

      // @ts-ignore
      config.set('numOfRuns', config.get('numOfRuns') + 1)

      // @ts-ignore
      if (config.get('numOfRuns') >= 10) {
        await findLatestCLIVersion(config)
        config.set('numOfRuns', 0)
      }

      if (command === 'config') {
        return processConfig(argvMain, config)
      }

      if (command === 'auth') {
        return await processAuth(argvMain, config)
      }

      if (command === 'lambda') {
        return await processLambda(argvMain)
      }

      if (command === 'scan') {
        return await processScan(config, argvMain)
      }

      if (command === 'audit') {
        return await processAudit(config, argvMain)
      }

      if (
        command === 'help' ||
        argvMain.includes('--help') ||
        Object.keys(mainOptions).length === 0
      ) {
        console.log(mainUsageGuide)
      } else if (mainOptions._unknown !== undefined) {
        const foundCommand = findCommandOnError(mainOptions._unknown)

        foundCommand
          ? console.log(
              `Unknown Command: Did you mean "${foundCommand}"? \nUse "${foundCommand} --help" for the full list of options`
            )
          : console.log(`\nUnknown Command: ${command} \n`)
        console.log(mainUsageGuide)
        await sendTelemetryConfigAsConfObj(
          config,
          command,
          argvMain,
          'FAILURE',
          'undefined'
        )
      } else {
        console.log(`\nUnknown Command: ${command}\n`)
        console.log(mainUsageGuide)
        await sendTelemetryConfigAsConfObj(
          config,
          command,
          argvMain,
          'FAILURE',
          'undefined'
        )
      }
      process.exit(9)
    } else {
      console.log(
        'Contrast supports Node versions >=16.13.2 <17. Please use one of those versions.'
      )
      process.exit(9)
    }
  } catch (err: any) {
    console.log()
    console.log(err.message.toString())
    process.exit(1)
  }
}

start()
