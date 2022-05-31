const i18n = require('i18n')
/**
 * Checks that the list of languages and files that has been reduced doesn't
 * contain more than one identified language.
 */
module.exports = exports = (analysis, next) => {
  const { languageAnalysis } = analysis
  try {
    checkForMultipleIdentifiedLanguages(languageAnalysis.identifiedLanguages)
  } catch (err) {
    next(err)
    return
  }
  next()
}

const checkForMultipleIdentifiedLanguages = identifiedLanguages => {
  if (Object.keys(identifiedLanguages).length > 1) {
    // Handle the error case where multiple languages have been identified
    let errMsg = i18n.__('languageAnalysisMultipleLanguages1')

    for (const [language, { projectFilenames }] of Object.entries(
      identifiedLanguages
    )) {
      errMsg += `\t${language}: ${projectFilenames.join(', ')}\n`
    }

    errMsg += i18n.__('languageAnalysisMultipleLanguages2', "'project_path'")

    throw new Error(errMsg)
  }
}

//For testing purposes
exports.checkForMultipleIdentifiedLanguages = checkForMultipleIdentifiedLanguages
