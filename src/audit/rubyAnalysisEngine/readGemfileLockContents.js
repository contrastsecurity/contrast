const fs = require('fs')
const i18n = require('i18n')

module.exports = exports = ({ language: { lockFilePath }, ruby }, next) => {
  try {
    ruby.rawLockFileContents = fs.readFileSync(lockFilePath, 'utf8')
    next()
  } catch (err) {
    next(
      new Error(
        i18n.__('rubyAnalysisEngineReadGemLockFileError', lockFilePath) +
          `${err.message}`
      )
    )
    return
  }
}
