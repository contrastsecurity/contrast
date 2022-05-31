const fs = require('fs')
const i18n = require('i18n')

module.exports = exports = ({ language: { lockFilePath }, node }, next) => {
  // check if the lockFilename is populated and if it is check to
  // see if it has the package-lock if not then go on to next handler
  if (!lockFilePath || !lockFilePath.includes('package-lock.json')) {
    next()
    return
  }

  try {
    node.rawLockFileContents = fs.readFileSync(lockFilePath)
  } catch (err) {
    next(
      new Error(i18n.__('NodeReadNpmError', lockFilePath) + `${err.message}`)
    )

    return
  }

  next()
}
