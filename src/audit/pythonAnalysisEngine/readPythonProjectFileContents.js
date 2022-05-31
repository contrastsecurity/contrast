const fs = require('fs')
const i18n = require('i18n')

module.exports = exports = (
  { language: { projectFilePath }, python },
  next
) => {
  try {
    //project file Contents points to requirements.txt for python
    python.rawProjectFileContents = fs.readFileSync(projectFilePath, 'utf8')

    next()
  } catch (err) {
    next(
      new Error(
        i18n.__('pythonAnalysisReadPythonProjectFileError', projectFilePath) +
          `${err.message}`
      )
    )
    return
  }
}
