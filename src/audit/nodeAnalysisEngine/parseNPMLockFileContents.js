const i18n = require('i18n')
module.exports = exports = ({ language: { lockFilePath }, node }, next) => {
  // If we never read the package-lock file then pass priority
  if (node.rawLockFileContents === undefined) {
    next()
  } else {
    try {
      node.npmLockFile = JSON.parse(node.rawLockFileContents)
    } catch (err) {
      next(
        new Error(
          i18n.__('NodeParseNPM', lockFilePath ? lockFilePath : 'undefined') +
            `${err.message}`
        )
      )
      return
    }
    next()
  }
}
