const AnalysisEngine = require('../AnalysisEngine')
const readProjectFileContents = require('./readProjectFileContents')
const parseProjectFileContents = require('./parseProjectFileContents')
const sanitizer = require('./sanitizer')
const i18n = require('i18n')

module.exports = exports = (language, config, callback) => {
  const ae = new AnalysisEngine({ language, config, go: {} })
  ae.use([readProjectFileContents, parseProjectFileContents, sanitizer])

  ae.analyze((err, analysis) => {
    if (err) {
      callback(new Error(i18n.__('goAnalysisError') + `${err.message}`))
      return
    }
    callback(null, analysis)
  })
}
