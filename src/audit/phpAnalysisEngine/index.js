const AnalysisEngine = require('../AnalysisEngine')

const readProjectFileContents = require('./readProjectFileContents')
const readLockFileContents = require('./readLockFileContents')
const parseLockFileContents = require('./parseLockFileContents')
const sanitizer = require('./sanitizer')
const i18n = require('i18n')

module.exports = exports = (language, config, callback) => {
  const ae = new AnalysisEngine({ language, config, php: {} })

  ae.use([
    readProjectFileContents,
    readLockFileContents,
    parseLockFileContents,
    sanitizer
  ])

  ae.analyze((err, analysis) => {
    if (err) {
      callback(new Error(i18n.__('phpAnalysisFailure') + `${err.message}`))
      return
    }

    callback(null, analysis)
  })
}
