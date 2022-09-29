import logSymbols from 'log-symbols'
import chalk from 'chalk'
import i18n from 'i18n'
import {
  FunctionConfiguration,
  ListFunctionsCommand
} from '@aws-sdk/client-lambda'
import { groupBy, sortBy } from 'lodash'
import { getLambdaClient } from './aws'
import ora from '../utils/oraWrapper'
import { LambdaOptions } from './lambda'
import { log, getReadableFileSize } from './logUtils'

type RuntimeLanguage = 'java' | 'python' | 'node'

type FilterLambdas = {
  runtimes: RuntimeLanguage[]
  filterText?: string
}

/**
 *
 * @param fucntions all user lambdas
 * @param options filter values: runtime / free text
 * @returns
 */
const printAvailableLambdas = (
  fucntions: FunctionConfiguration[] = [],
  options: FilterLambdas
) => {
  const { runtimes, filterText = '' } = options
  const searchValue = filterText?.trim().toLowerCase()

  const filteredFunctions = fucntions
    .filter(f => runtimes.some(r => f.Runtime?.includes(r)))
    .filter(f => f.FunctionName?.toLowerCase().includes(searchValue))
  log(
    i18n.__('availableForScan', {
      icon: logSymbols.success,
      count: `${filteredFunctions.length}`
    })
  )
  const groupByRuntime = groupBy(filteredFunctions, 'Runtime')

  Object.entries(groupByRuntime).forEach(([runtime, arr]) => {
    const sorted = sortBy(arr, 'FunctionName')
    const count = `${arr.filter(a => a.Runtime === runtime).length}`

    log(chalk.gray(i18n.__('runtimeCount', { runtime, count })))
    sorted.forEach(f => {
      const size = f.CodeSize ? getReadableFileSize(f.CodeSize) : ''
      log(`${f.FunctionName} ${chalk.gray(`(${size})`)}`)
    })
  })
}

/**
 *
 * @param lambdaOptions to create lambdaClient
 * @returns list of all user lambdas that availbale to scan
 */
const getAllLambdas = async (lambdaOptions: LambdaOptions) => {
  const functions: FunctionConfiguration[] = []
  const spinner = ora.returnOra(i18n.__('loadingFunctionList'))

  try {
    const client = getLambdaClient(lambdaOptions)
    const command = new ListFunctionsCommand({})

    ora.startSpinner(spinner)

    const data = await client.send(command)
    const { Functions } = data
    let { NextMarker } = data

    if (!Functions?.length) {
      ora.failSpinner(spinner, i18n.__('noFunctionsFound'))
      return
    }

    functions.push(...Functions)
    spinner.text = i18n.__('functionsFound', { count: `${functions.length}` })

    // pagination on functions
    while (NextMarker) {
      command.input.Marker = NextMarker
      const chank = await client.send(command)

      if (chank.Functions?.length) {
        functions.push(...chank.Functions)
        spinner.text = i18n.__('functionsFound', {
          count: `${functions.length}`
        })
      }

      NextMarker = chank.NextMarker
    }

    ora.succeedSpinner(
      spinner,
      i18n.__('functionsFound', { count: `${functions.length}` })
    )
  } catch (error) {
    ora.failSpinner(spinner, i18n.__('failedToLoadFunctions'))
    throw error
  }

  return functions
}

export { getAllLambdas, printAvailableLambdas }
