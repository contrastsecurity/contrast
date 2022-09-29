const multiReplace = require('string-multiple-replace')
const fs = require('fs')
const i18n = require('i18n')

const readAndParseProjectFile = file => {
  const filePath = filePathForWindows(file + '/Pipfile')
  const pipFile = fs.readFileSync(filePath, 'utf8')

  const matcherObj = { '"': '' }
  const sequencer = ['"']
  const parsedPipfile = multiReplace(pipFile, matcherObj, sequencer)

  const pythonArray = parsedPipfile.split('\n')

  return pythonArray.filter(element => element !== '' && !element.includes('#'))
}

const readAndParseLockFile = file => {
  const filePath = filePathForWindows(file + '/Pipfile.lock')
  const lockFile = fs.readFileSync(filePath, 'utf8')
  let parsedPipLock = JSON.parse(lockFile)
  parsedPipLock['defaults'] = parsedPipLock['default']
  delete parsedPipLock['default']
  return parsedPipLock
}

const readLockFile = file => {
  const filePath = filePathForWindows(file + '/Pipfile.lock')
  const lockFile = fs.readFileSync(filePath, 'utf8')
  let parsedPipLock = JSON.parse(lockFile)
  return parsedPipLock['default']
}

const scaPythonParser = pythonDependencies => {
  let pythonParsedDeps = {}
  for (let key in pythonDependencies) {
    pythonParsedDeps[key] = {}
    pythonParsedDeps[key].version = pythonDependencies[key].version.replace(
      '==',
      ''
    )
    pythonParsedDeps[key].group = null
    pythonParsedDeps[key].name = key
    pythonParsedDeps[key].isProduction = true
    pythonParsedDeps[key].dependencies = []
    pythonParsedDeps[key].directDependency = true
  }
  return pythonParsedDeps
}

const checkForCorrectFiles = languageFiles => {
  if (!languageFiles.includes('Pipfile.lock')) {
    throw new Error(i18n.__('languageAnalysisHasNoLockFile', 'python'))
  }

  if (!languageFiles.includes('Pipfile')) {
    throw new Error(i18n.__('languageAnalysisProjectFileError', 'python'))
  }
}

const getPythonDeps = (config, languageFiles) => {
  try {
    if (config.experimental) {
      let pythonLockFileContents = readLockFile(config.file)
      return scaPythonParser(pythonLockFileContents)
    } else {
      checkForCorrectFiles(languageFiles)
      const parseProject = readAndParseProjectFile(config.file)
      const parsePip = readAndParseLockFile(config.file)

      return { pipfileLock: parsePip, pipfilDependanceies: parseProject }
    }
  } catch (err) {
    console.log(err.message.toString())
    process.exit(1)
  }
}

const filePathForWindows = path => {
  if (process.platform === 'win32') {
    path = path.replace(/\//g, '\\')
  }
  return path
}

module.exports = {
  getPythonDeps,
  scaPythonParser,
  readAndParseLockFile,
  readAndParseProjectFile,
  checkForCorrectFiles,
  readLockFile
}
