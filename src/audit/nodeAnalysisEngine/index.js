const AnalysisEngine = require('../AnalysisEngine')

const readProjectFileContents = require('./readProjectFileContents')
const readNPMLockFileContents = require('./readNPMLockFileContents')
const parseNPMLockFileContents = require('./parseNPMLockFileContents')
const readYarnLockFileContents = require('./readYarnLockFileContents')
const parseYarnLockFileContents = require('./parseYarnLockFileContents')
const parseYarn2LockFileContents = require('./parseYarn2LockFileContents')
const handleNPMLockFileV2 = require('./handleNPMLockFileV2')
const sanitizer = require('./sanitizer')
const i18n = require('i18n')

module.exports = exports = (language, config, callback) => {
  const ae = new AnalysisEngine({ language, config, node: {} })

  ae.use([
    readProjectFileContents,
    readNPMLockFileContents,
    parseNPMLockFileContents,
    readYarnLockFileContents,
    parseYarnLockFileContents,
    parseYarn2LockFileContents,
    handleNPMLockFileV2,
    sanitizer
  ])

  ae.analyze((err, analysis) => {
    if (err) {
      callback(new Error(i18n.__('NodeAnalysisFailure') + `${err.message}`))
      return
    }

    callback(null, analysis)
  })
}
