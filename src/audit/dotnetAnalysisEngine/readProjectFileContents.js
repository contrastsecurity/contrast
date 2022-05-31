const fs = require('fs')
const i18n = require('i18n')

module.exports = exports = (analysis, next) => {
  const {
    language: { projectFilePath },
    dotnet
  } = analysis

  // Read the .NET project file contents. We are reading into memory presuming
  // that the contents of the file aren't large which may be bad... Could look
  // into streaming in the future
  try {
    dotnet.rawProjectFileContents = fs.readFileSync(projectFilePath)
  } catch (err) {
    next(
      new Error(
        i18n.__('dotnetReadProjectFile', projectFilePath) + `${err.message}`
      )
    )

    return
  }

  next()
}
