const AnalysisEngine = require('./../AnalysisEngine')

const readGemfileContents = require('./readGemfileContents')
const readGemfileLockContents = require('./readGemfileLockContents')
const parsedGemfile = require('./parsedGemfile')
const parseGemfileLockFileContents = require('./parseGemfileLockContents')
const sanitizer = require('./sanitizer')
const i18n = require('i18n')

module.exports = exports = (language, config, callback) => {
  const ae = new AnalysisEngine({ language, config, ruby: {} })

  // Ruby dependency management is mostly handled by bundler which creates
  // Gemfile and Gemfile.lock. This project will only pick up on those
  ae.use([
    readGemfileContents,
    parsedGemfile,
    readGemfileLockContents,
    parseGemfileLockFileContents,
    sanitizer
  ])

  ae.analyze((err, analysis) => {
    if (err) {
      callback(new Error(i18n.__('rubyAnalysisEngineError') + `${err.message}`))
      return
    }
    callback(null, analysis)
  })
}
