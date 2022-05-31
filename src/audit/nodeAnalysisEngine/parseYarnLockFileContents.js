const yarnParser = require('@yarnpkg/lockfile')
const i18n = require('i18n')

module.exports = exports = ({ language: { lockFilename }, node }, next) => {
  // If we never read the lock file then pass priority
  if (node.rawYarnLockFileContents === undefined || node.yarnVersion === 2) {
    next()
  } else {
    try {
      node.yarnLockFile = yarnParser.parse(node.rawYarnLockFileContents)
    } catch (err) {
      next(
        new Error(
          i18n.__(
            'NodeParseYarn',
            lockFilename.lockFilePath ? lockFilename.lockFilePath : 'undefined'
          ) + `${err.message}`
        )
      )

      return
    }

    next()
  }
}
