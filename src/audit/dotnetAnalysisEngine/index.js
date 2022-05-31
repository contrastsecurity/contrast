const AnalysisEngine = require('../AnalysisEngine')
const readProjectFileContents = require('./readProjectFileContents')
const parseProjectFileContents = require('./parseProjectFileContents')
const readLockFileContents = require('./readLockFileContents')
const parseLockFileContents = require('./parseLockFileContents')
const sanitizer = require('./sanitizer')
const i18n = require('i18n')

module.exports = exports = (language, config, callback) => {
  const ae = new AnalysisEngine({ language, config, dotnet: {} })
  ae.use([
    readProjectFileContents,
    parseProjectFileContents,
    readLockFileContents,
    parseLockFileContents,
    sanitizer
  ])

  ae.analyze((err, analysis) => {
    if (err) {
      callback(new Error(i18n.__('dotnetAnalysisFailure') + err.message))
      return
    }
    callback(null, analysis)
  })
}
