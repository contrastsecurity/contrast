const i18n = require('i18n')
const _ = require('lodash')
module.exports = exports = ({ language: { lockFilePath }, php }, next) => {
  try {
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
            addChildDepToLockFileAsOwnObj(value['require'], dep)
          }
        })
      }

      if (value['require-dev']) {
        const listOfRequiresDep = Object.keys(value['require-dev'])
        listOfRequiresDep.forEach(dep => {
          if (!listOfTopDep.includes(dep)) {
            addChildDepToLockFileAsOwnObj(value['require-dev'], dep)
          }
        })
      }
    })

    formatParentDepToLockFile()
  } catch (err) {
    next(
      new Error(
        i18n.__('phpParseComposerLock', lockFilePath) + `${err.message}`
      )
    )
    return
  }
  next()

  function addChildDepToLockFileAsOwnObj(depObj, key) {
    php.lockFile.dependencies[key] = { version: depObj[key] }
  }

  function formatParentDepToLockFile() {
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
}
