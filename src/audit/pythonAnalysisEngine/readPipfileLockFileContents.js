const fs = require('fs')
const i18n = require('i18n')

module.exports = exports = ({ language: { lockFilePath }, python }, next) => {
  try {
    python.rawLockFileContents = fs.readFileSync(lockFilePath)
  } catch (err) {
    next(
      new Error(
        i18n.__('pythonAnalysisReadPipFileError', lockFilePath) +
          `${err.message}`
      )
    )
  }
  next()
}
