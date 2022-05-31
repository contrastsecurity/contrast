const i18n = require('i18n')
module.exports = exports = ({ language: { lockFilename }, node }, next) => {
  // If we never read the lock file or its an earlier version then pass priority
  if (node.rawYarnLockFileContents == undefined || node.yarnVersion == 1) {
    next()
  } else {
    try {
      node.yarnLockFile = {}
      node.yarnLockFile['object'] = node.rawYarnLockFileContents
      delete node.yarnLockFile['object'].__metadata
      node.yarnLockFile['type'] = 'success'

      Object.entries(node.rawYarnLockFileContents).forEach(([key, value]) => {
        const rawKeyNames = key.split(',')
        const keyNames = formatKey(rawKeyNames)

        keyNames.forEach(name => {
          node.yarnLockFile.object[name] = value
        })
      })
    } catch (err) {
      next(
        new Error(
          i18n.__('NodeParseYarn2', lockFilename.lockFilePath) +
            `${err.message}`
        )
      )

      return
    }

    next()
  }
}

function formatKey(keyNames) {
  let name = ''
  let formattedNames = []
  keyNames.forEach(dummyString => {
    let nameArr = dummyString.split('@')
    if (nameArr.length > 1) {
      if (nameArr.length == 2) {
        name = nameArr[0]
      }

      if (nameArr.length == 3) {
        name = '@' + nameArr[1]
      }

      let version = dummyString.split(':').pop('')

      if (version.length == 1 && version != '*') {
        version = version + '.0'
      }
      let reformattedKey = name.trim() + '@' + version

      formattedNames.push(reformattedKey)
    }
  })
  return formattedNames
}

exports.formatKey = formatKey
