const AnalysisEngine = require('./../AnalysisEngine')
const i18n = require('i18n')

const getProjectRootFilenames = require('./getProjectRootFilenames')
const reduceIdentifiedLanguages = require('./reduceIdentifiedLanguages')
const checkForMultipleIdentifiedLanguages = require('./checkForMultipleIdentifiedLanguages')
const checkForMultipleIdentifiedProjectFiles = require('./checkForMultipleIdentifiedProjectFiles')
const checkIdentifiedLanguageHasProjectFile = require('./checkIdentifiedLanguageHasProjectFile')
const checkIdentifiedLanguageHasLockFile = require('./checkIdentifiedLanguageHasLockFile')
const getIdentifiedLanguageInfo = require('./getIdentifiedLanguageInfo')
const { libraryAnalysisError } = require('../../common/errorHandling')

module.exports = exports = (projectPath, callback, appId, config) => {
  // Create an analysis engine to identify the project language
  const ae = new AnalysisEngine({
    projectPath,
    appId,
    languageAnalysis: { appId: appId },
    config
  })

  ae.use([
    getProjectRootFilenames,
    reduceIdentifiedLanguages,
    checkForMultipleIdentifiedLanguages,
    checkForMultipleIdentifiedProjectFiles,
    checkIdentifiedLanguageHasProjectFile,
    checkIdentifiedLanguageHasLockFile,
    getIdentifiedLanguageInfo
  ])

  ae.analyze((err, analysis) => {
    if (err) {
      console.log(
        '*******************' +
          i18n.__('languageAnalysisFailureMessage') +
          '****************'
      )
      console.error(`${err.message}`)
      libraryAnalysisError()
      process.exit(1)
    }
    callback(null, analysis)
  })
}
