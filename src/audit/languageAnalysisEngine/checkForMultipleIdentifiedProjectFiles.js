const i18n = require('i18n')
/**
 * Checks that the list of languages and files that has been reduced doesn't
 * contain more than one project file for any identified language.
 */
module.exports = exports = (analysis, next) => {
  const { languageAnalysis } = analysis
  try {
    checkForMultipleIdentifiedProjectFiles(languageAnalysis.identifiedLanguages)
  } catch (err) {
    next(err)
    return
  }
  next()
}

const checkForMultipleIdentifiedProjectFiles = identifiedLanguages => {
  // Handle the error case where only a single language has been identified...
  if (Object.keys(identifiedLanguages).length == 1) {
    let { projectFilenames } = Object.values(identifiedLanguages)[0]

    // ...but multiple project files for that language have been found
    if (projectFilenames.length > 1) {
      const [language] = Object.keys(identifiedLanguages)
      projectFilenames = projectFilenames.join(', ')

      // NOTE : Quotation marks for language needs to be added back in (this includes tests)
      throw new Error(
        i18n.__(
          'languageAnalysisProjectFiles',
          language,
          projectFilenames,
          "'project_path'"
        )
      )
    }
  }
}

//For testing purposes
exports.checkForMultipleIdentifiedProjectFiles = checkForMultipleIdentifiedProjectFiles
