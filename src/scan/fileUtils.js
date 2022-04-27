const fg = require('fast-glob')
const fs = require('fs')
const i18n = require('i18n')

const findFile = async () => {
  console.log(i18n.__('searchingScanFileDirectory', process.cwd()))
  return fg(['**/*.jar', '**/*.war', '**/*.zip', '**/*.dll'], {
    dot: false,
    deep: 3,
    onlyFiles: true
  })
}

const checkFilePermissions = file => {
  let readableFile = false
  try {
    fs.accessSync(file, fs.constants.R_OK)
    return (readableFile = true) // testing purposes
  } catch (err) {
    console.log('Invalid permissions found on ', file)
    process.exit(0)
  }
}

const fileExists = path => {
  return fs.existsSync(path)
}

module.exports = {
  findFile,
  fileExists,
  checkFilePermissions
}
