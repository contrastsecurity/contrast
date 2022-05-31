const i18n = require('i18n')

/**
 * Checks that a project has a lock file
 */
module.exports = exports = (analysis, next) => {
  try {
    const { languageAnalysis } = analysis
    //.NET and NODE both need lock files. currently JAVA and GO do not
    // need a lock file so if lang is JAVA / GO just go to next
    if (
      Object.getOwnPropertyNames(languageAnalysis.identifiedLanguages)[0] ===
        'JAVA' ||
      Object.getOwnPropertyNames(languageAnalysis.identifiedLanguages)[0] ===
        'GO'
    ) {
      next()
      return
    }
    checkForLockFile(languageAnalysis.identifiedLanguages)
  } catch (err) {
    next(err)
    return
  }
  next()
  return
}

const checkForLockFile = identifiedLanguages => {
  // Handle the error case where only a single language has been identified...
  if (Object.keys(identifiedLanguages).length == 1) {
    let { lockFilenames } = Object.values(identifiedLanguages)[0]

    // ...but no lock files for that language have been found
    if (lockFilenames.length == 0) {
      const [language] = Object.keys(identifiedLanguages)
      throw new Error(i18n.__('languageAnalysisHasNoLockFile', language))
    }

    if (lockFilenames.length > 1) {
      const [language] = Object.keys(identifiedLanguages)
      throw new Error(
        i18n.__(
          'languageAnalysisHasMultipleLockFiles',
          language,
          String(lockFilenames)
        )
      )
    }
  }
}

//For testing purposes
exports.checkForLockFile = checkForLockFile
