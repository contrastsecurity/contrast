const AnalysisEngine = require('../AnalysisEngine')

const readProjectFileContents = require('./readProjectFileContents')
const parseMavenProjectFileContents = require('./parseMavenProjectFileContents')
const parseProjectFileContents = require('./parseProjectFileContents')
const sanitizer = require('./sanitizer')
const i18n = require('i18n')

module.exports = exports = (language, config, callback) => {
  const ae = new AnalysisEngine({ language, config, java: {} })

  // Remove ".kts" from filename to look the same as a Gradle projectFileName so we can support Kotlin
  language.projectFilePath = language.projectFilePath.replace(
    'build.gradle.kts',
    'build.gradle'
  )

  if (config['beta_unified_java_parser']) {
    console.log('Using new parser...')
    ae.use([readProjectFileContents, parseProjectFileContents, sanitizer])
  } else if (
    language.projectFilePath.endsWith('pom.xml') &&
    !config['beta_unified_java_parser']
  ) {
    ae.use([readProjectFileContents, parseMavenProjectFileContents, sanitizer])
  } else {
    ae.use([
      readProjectFileContents,
      parseMavenProjectFileContents,
      parseProjectFileContents,
      sanitizer
    ])
  }
  ae.analyze((err, analysis) => {
    if (err) {
      console.log(i18n.__('javaAnalysisError'), err.message)
      return
    }
    callback(null, analysis, config)
  }, config)
}
