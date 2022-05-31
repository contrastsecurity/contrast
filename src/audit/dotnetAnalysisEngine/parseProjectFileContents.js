const xml2js = require('xml2js')
const i18n = require('i18n')

module.exports = exports = (
  { language: { projectFilePath }, dotnet },
  next
) => {
  const { rawProjectFileContents } = dotnet

  // Read the .NET project file contents. We are reading into memory presuming
  // that the contents of the file aren't large which may be bad... Could look
  // into streaming in the future
  // explicitArray: false - to not abuse of arrays, with this option we are able to read JSON properties in an easier way
  // mergeAttrs: true  - to merge attributes and child elements as properties of the parent
  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true })
  parser.parseString(rawProjectFileContents, (err, projectFileXML) => {
    if (err) {
      next(
        new Error(i18n.__('dotnetParseProjectFile', projectFilePath) + `${err}`)
      )

      return
    }

    dotnet.projectFile = projectFileXML

    next()
  })
}
