const analysis = require('./analysis')
const { parseBuildDeps } = require('./javaBuildDepsParser')
const { createJavaTSMessage } = require('../common/formatMessage')
const {
  parseDependenciesForSCAServices
} = require('../common/scaParserForGoAndJava')

const javaAnalysis = (config, languageFiles) => {
  languageFiles.JAVA.forEach(file => {
    file.replace('build.gradle.kts', 'build.gradle')
  })

  const javaDeps = buildJavaTree(config, languageFiles.JAVA)

  if (config.experimental) {
    return parseDependenciesForSCAServices(javaDeps)
  } else {
    return createJavaTSMessage(javaDeps)
  }
}

const buildJavaTree = (config, files) => {
  const javaBuildDeps = analysis.getJavaBuildDeps(config, files)
  return parseBuildDeps(config, javaBuildDeps)
}

module.exports = {
  javaAnalysis
}
