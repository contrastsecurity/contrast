import chalk from 'chalk'
import util from 'util'

interface logStyles {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
}

const log = (message: string | number, styles?: logStyles) => {
  let chalkFunction = chalk.reset

  if (styles?.bold) {
    chalkFunction = chalk.bold
  } else if (styles?.italic) {
    chalkFunction = chalk.italic
  } else if (styles?.underline) {
    chalkFunction = chalk.underline
  } else if (styles?.strikethrough) {
    chalkFunction = chalk.strikethrough
  }

  console.log(styles ? chalkFunction(message) : message)
}

/**
 *
 * @param obj any json object or string
 * @param depth determines how levels it will recurse to show the json
 */
const prettyPrintJson = (obj: string | any, depth: number | null = null) => {
  if (!obj) {
    return
  }

  let objToPrint = obj

  if (typeof obj === 'string') {
    objToPrint = JSON.parse(obj)
  }

  console.log(util.inspect(objToPrint, { colors: true, depth }))
}

/**
 *
 * @param fileSizeInBytes
 *
 * @returns human readable format
 */
const getReadableFileSize = (fileSizeInBytes: number) => {
  let i = -1
  const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']

  do {
    fileSizeInBytes = fileSizeInBytes / 1024
    i++
  } while (fileSizeInBytes > 1024)

  return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
}

export { log, prettyPrintJson, getReadableFileSize }
