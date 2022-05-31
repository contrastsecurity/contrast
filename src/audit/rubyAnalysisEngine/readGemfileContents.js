const fs = require('fs')
const i18n = require('i18n')

module.exports = exports = ({ language: { projectFilePath }, ruby }, next) => {
  try {
    ruby.rawProjectFileContents = fs.readFileSync(projectFilePath, 'utf8')

    next()
  } catch (err) {
    next(
      new Error(
        i18n.__('rubyAnalysisEngineReadGemFileError', projectFilePath) +
          `${err.message}`
      )
    )
    return
  }
}
