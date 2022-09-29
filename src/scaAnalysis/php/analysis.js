const fs = require('fs')
const i18n = require('i18n')
const _ = require('lodash')

const readFile = (config, nameOfFile) => {
  if (config.file) {
    try {
      return fs.readFileSync(config.file + '/' + nameOfFile, 'utf8')
    } catch (error) {
      console.log('Unable to find file')
      console.log(error)
    }
  }
}

const parseProjectFiles = php => {
  try {
    // composer.json
    php.composerJSON.dependencies = php.composerJSON.require
    php.composerJSON.devDependencies = php.composerJSON['require-dev']

    // composer.lock
    php.lockFile = php.rawLockFileContents
    let packages = _.keyBy(php.lockFile.packages, 'name')
    let packagesDev = _.keyBy(php.lockFile['packages-dev'], 'name')
    php.lockFile.dependencies = _.merge(packages, packagesDev)

    const listOfTopDep = Object.keys(php.lockFile.dependencies)

    Object.entries(php.lockFile.dependencies).forEach(([key, value]) => {
      if (value.require) {
        const listOfRequiresDep = Object.keys(value.require)
        listOfRequiresDep.forEach(dep => {
          if (!listOfTopDep.includes(dep)) {
            addChildDepToLockFileAsOwnObj(php, value['require'], dep)
          }
        })
      }

      if (value['require-dev']) {
        const listOfRequiresDep = Object.keys(value['require-dev'])
        listOfRequiresDep.forEach(dep => {
          if (!listOfTopDep.includes(dep)) {
            addChildDepToLockFileAsOwnObj(php, value['require-dev'], dep)
          }
        })
      }
    })
    formatParentDepToLockFile(php)
    delete php.rawLockFileContents
    return php
  } catch (err) {
    return console.log(i18n.__('phpParseComposerLock', php) + `${err.message}`) // not sure on this
  }
}

function addChildDepToLockFileAsOwnObj(php, depObj, key) {
  php.lockFile.dependencies[key] = { version: depObj[key] }
}

function formatParentDepToLockFile(php) {
  for (const [key, value] of Object.entries(php.lockFile.dependencies)) {
    let requires = {}
    for (const [childKey, childValue] of Object.entries(value)) {
      if (childKey === 'require' || childKey === 'require-dev') {
        requires = _.merge(requires, childValue)
        php.lockFile.dependencies[key].requires = requires
        delete php.lockFile.dependencies[key].require
        delete php.lockFile.dependencies[key]['require-dev']
      }
    }
  }
}

module.exports = {
  parseProjectFiles,
  readFile
}
