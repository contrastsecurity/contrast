const analysis = require('./analysis')
const i18n = require('i18n')
const formatMessage = require('../common/formatMessage')
const scaServiceParser = require('./scaServiceParser')

const jsAnalysis = async (config, languageFiles) => {
  checkForCorrectFiles(languageFiles)

  if (!config.file.endsWith('/')) {
    config.file = config.file.concat('/')
  }
  return buildNodeTree(config, languageFiles.JAVASCRIPT)
}
const buildNodeTree = async (config, files) => {
  let analysis = await readFiles(config, files)
  const rawNode = await parseFiles(config, files, analysis)
  if (config.experimental) {
    return scaServiceParser.parseJS(rawNode)
  }
  return formatMessage.createJavaScriptTSMessage(rawNode)
}

const readFiles = async (config, files) => {
  let js = {}

  js.packageJSON = JSON.parse(
    await analysis.readFile(config, files, 'package.json')
  )

  if (files.includes('package-lock.json')) {
    js.rawLockFileContents = await analysis.readFile(
      config,
      files,
      'package-lock.json'
    )
  }
  if (files.includes('yarn.lock')) {
    js.yarn = {}
    js.yarn = await analysis.readYarn(config, files, 'yarn.lock')
  }

  return js
}

const parseFiles = async (config, files, js) => {
  if (files.includes('package-lock.json')) {
    js.npmLockFile = await analysis.parseNpmLockFile(js)
  }
  if (files.includes('yarn.lock')) {
    js = await analysis.parseYarnLockFile(js)
  }

  return js
}

const checkForCorrectFiles = languageFiles => {
  if (
    languageFiles.JAVASCRIPT.includes('package-lock.json') &&
    languageFiles.JAVASCRIPT.includes('yarn.lock')
  ) {
    throw new Error(
      i18n.__('languageAnalysisHasMultipleLockFiles', 'javascript')
    )
  }

  if (
    !languageFiles.JAVASCRIPT.includes('package-lock.json') &&
    !languageFiles.JAVASCRIPT.includes('yarn.lock')
  ) {
    throw new Error(i18n.__('languageAnalysisHasNoLockFile', 'javascript'))
  }

  if (!languageFiles.JAVASCRIPT.includes('package.json')) {
    throw new Error(i18n.__('languageAnalysisHasNoPackageJsonFile'))
  }
}
module.exports = {
  jsAnalysis
}
