const fs = require('fs')
const xml2js = require('xml2js')
const i18n = require('i18n')

const readAndParseProjectFile = projectFilePath => {
  const projectFile = fs.readFileSync(projectFilePath)

  return new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true
  }).parseString(projectFile)
}

const readAndParseLockFile = lockFilePath => {
  const lockFile = JSON.parse(fs.readFileSync(lockFilePath).toString())

  let count = 0 // Used to test if some nodes are deleted

  for (const dependenciesNode in lockFile.dependencies) {
    for (const innerNode in lockFile.dependencies[dependenciesNode]) {
      const nodeValidation = JSON.stringify(
        lockFile.dependencies[dependenciesNode][innerNode]
      )
      if (nodeValidation.includes('"type":"Project"')) {
        count += 1
        delete lockFile.dependencies[dependenciesNode][innerNode]
        lockFile.additionalInfo = 'dependenciesNote'
      }
    }
  }

  if (count > 0) {
    const multiLevelProjectWarning = () => {
      console.log('')
      console.log(i18n.__('dependenciesNote'))
    }
    setTimeout(multiLevelProjectWarning, 7000)
  }

  return lockFile
}

const checkForCorrectFiles = languageFiles => {
  if (!languageFiles.includes('packages.lock.json')) {
    throw new Error(i18n.__('languageAnalysisHasNoLockFile', '.NET'))
  }

  if (!languageFiles.some(i => i.includes('.csproj'))) {
    throw new Error(i18n.__('languageAnalysisProjectFileError', '.NET'))
  }
}

const getDotNetDeps = (filePath, languageFiles) => {
  checkForCorrectFiles(languageFiles)
  const projectFileName = languageFiles.find(fileName =>
    fileName.includes('.csproj')
  )
  const lockFileName = languageFiles.find(fileName =>
    fileName.includes('.json')
  )
  const projectFile = readAndParseProjectFile(filePath + `/${projectFileName}`)
  const lockFile = readAndParseLockFile(filePath + `/${lockFileName}`)

  return { projectFile, lockFile }
}

module.exports = {
  getDotNetDeps,
  readAndParseProjectFile,
  readAndParseLockFile,
  checkForCorrectFiles
}
