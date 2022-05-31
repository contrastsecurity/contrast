const i18n = require('i18n')
/**
 * Checks that a single identified language in the list of languages and files
 * that has been reduced has a single project file. This is important in the
 * (uncommon) case that a project has a lock file without a project file.
 */
module.exports = exports = (analysis, next) => {
  const { languageAnalysis } = analysis
  try {
    checkIdentifiedLanguageHasProjectFile(languageAnalysis.identifiedLanguages)
  } catch (err) {
    next(err)
    return
  }
  next()
}

const checkIdentifiedLanguageHasProjectFile = identifiedLanguages => {
  // Handle the error case where only a single language has been identified...
  if (Object.keys(identifiedLanguages).length == 1) {
    let { projectFilenames } = Object.values(identifiedLanguages)[0]

    // ...but no project files for that language have been found
    if (projectFilenames.length == 0) {
      const [language] = Object.keys(identifiedLanguages)
      throw new Error(i18n.__('languageAnalysisProjectFileError', language))
    }
  }
}

//For testing purposes
exports.checkIdentifiedLanguageHasProjectFile = checkIdentifiedLanguageHasProjectFile
