const fs = require('fs')
const i18n = require('i18n')

module.exports = exports = (analysis, next) => {
  const {
    language: { projectFilePath },
    node
  } = analysis

  // Read the NODE project file contents. We are reading into memory presuming
  // that the contents of the file aren't large which may be bad... Could look
  // into streaming in the future

  try {
    // package.json is stored in the projectFilePath other files have the word lock so are stored in lockFilename arr
    node.packageJSON = JSON.parse(fs.readFileSync(projectFilePath, 'utf8'))
  } catch (err) {
    next(
      new Error(
        i18n.__('nodeReadProjectFileError', projectFilePath) + `${err.message}`
      )
    )
    return
  }

  next()
}
