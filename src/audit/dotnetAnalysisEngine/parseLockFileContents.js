const i18n = require('i18n')

module.exports = exports = ({ language: { lockFilePath }, dotnet }, next) => {
  const { rawLockFileContents } = dotnet

  // If we never read the lock file then pass priority
  if (!rawLockFileContents) {
    next()

    return
  }

  try {
    let count = 0 // Used to test if some nodes are deleted
    dotnet.lockFile = JSON.parse(rawLockFileContents)

    for (const dependenciesNode in dotnet.lockFile.dependencies) {
      for (const innerNode in dotnet.lockFile.dependencies[dependenciesNode]) {
        const nodeValidation = JSON.stringify(
          dotnet.lockFile.dependencies[dependenciesNode][innerNode]
        )
        if (nodeValidation.includes('"type":"Project"')) {
          count += 1
          delete dotnet.lockFile.dependencies[dependenciesNode][innerNode]
          dotnet.additionalInfo = 'dependenciesNote'
        }
      }
    }

    // If dependencies removed wait for json to be displayed and flag warning
    if (count > 0) {
      const multiLevelProjectWarning = () => {
        console.log('')
        console.log(i18n.__('dependenciesNote'))
      }
      setTimeout(multiLevelProjectWarning, 7000)
    }
  } catch (err) {
    next(
      new Error(i18n.__('dotnetParseLockfile', lockFilePath) + `${err.message}`)
    )

    return
  }

  next()
}
