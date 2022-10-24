const analysis = require('./analysis')
const { parseBuildDeps } = require('./javaBuildDepsParser')
const { createJavaTSMessage } = require('../common/formatMessage')
const {
  parseDependenciesForSCAServices
} = require('../common/scaParserForGoAndJava')
const chalk = require('chalk')
const _ = require('lodash')

const javaAnalysis = async (config, languageFiles) => {
  languageFiles.JAVA.forEach(file => {
    file.replace('build.gradle.kts', 'build.gradle')
  })

  await getAgreement(config)

  const javaDeps = buildJavaTree(config, languageFiles.JAVA)

  if (config.experimental) {
    return parseDependenciesForSCAServices(javaDeps)
  } else {
    return createJavaTSMessage(javaDeps)
  }
}

const getAgreement = async config => {
  console.log(chalk.bold('Java project detected'))
  console.log(
    'Java analysis uses maven / gradle which are potentially susceptible to command injection. Be sure that the code you are running Contrast CLI on is trusted before continuing.'
  )

  if (!process.env.CI && !config?.javaAgreement) {
    return await analysis.agreementPrompt(config)
  }
  return config
}

const buildJavaTree = (config, files) => {
  const javaBuildDeps = analysis.getJavaBuildDeps(config, files)
  return parseBuildDeps(config, javaBuildDeps)
}

module.exports = {
  javaAnalysis,
  getAgreement
}
