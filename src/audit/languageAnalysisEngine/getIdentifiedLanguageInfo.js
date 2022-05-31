const path = require('path')

/**
 * Assemble analysis results into a common object to provide
 * language, project file name and paths
 */
module.exports = exports = (analysis, next) => {
  const { projectPath, languageAnalysis } = analysis
  languageAnalysis.identifiedLanguageInfo = getIdentifiedLanguageInfo(
    projectPath,
    languageAnalysis.identifiedLanguages
  )
  next()
}

const getIdentifiedLanguageInfo = (projectPath, identifiedLanguages) => {
  const [language] = Object.keys(identifiedLanguages)
  const {
    projectFilenames: [projectFilename],
    lockFilenames: [lockFilename]
  } = Object.values(identifiedLanguages)[0]

  let identifiedLanguageInfo = {
    language,
    projectFilename,
    projectFilePath: path.join(projectPath, projectFilename)
  }

  if (lockFilename) {
    identifiedLanguageInfo = {
      ...identifiedLanguageInfo,
      lockFilename,
      lockFilePath: path.join(projectPath, lockFilename)
    }
  }

  return identifiedLanguageInfo
}

//For testing purposes
exports.getIdentifiedLanguageInfo = getIdentifiedLanguageInfo
