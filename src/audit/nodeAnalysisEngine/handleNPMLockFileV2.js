const i18n = require('i18n')
module.exports = exports = (analysis, next) => {
  const {
    language: { lockFilePath },
    node
  } = analysis

  try {
    if (node.npmLockFile && node.npmLockFile.lockfileVersion > 1) {
      const listOfTopDep = Object.keys(node.npmLockFile.dependencies)
      Object.entries(node.npmLockFile.dependencies).forEach(([key, value]) => {
        if (value.requires) {
          const listOfRequiresDep = Object.keys(value.requires)
          listOfRequiresDep.forEach(dep => {
            if (!listOfTopDep.includes(dep)) {
              addDepToLockFile(value['requires'], dep)
            }
          })
        }

        if (value.dependencies) {
          Object.entries(value.dependencies).forEach(
            ([childKey, childValue]) => {
              if (childValue.requires) {
                const listOfRequiresDep = Object.keys(childValue.requires)
                listOfRequiresDep.forEach(dep => {
                  if (!listOfTopDep.includes(dep)) {
                    addDepToLockFile(childValue['requires'], dep)
                  }
                })
              }
            }
          )
        }
      })
    }
  } catch (err) {
    next(
      next(new Error(i18n.__('NodeParseNPM', lockFilePath) + `${err.message}`))
    )
    return
  }

  function addDepToLockFile(depObj, key) {
    node.npmLockFile.dependencies[key] = { version: depObj[key] }
  }

  next()
}
