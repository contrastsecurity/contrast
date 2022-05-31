const fs = require('fs')
const i18n = require('i18n')

module.exports = exports = (analysis, next) => {
  const {
    language: { lockFilePath },
    dotnet
  } = analysis

  // Make sure to check to see if there was a lock file detected as its not
  // required
  if (!lockFilePath) {
    next()
    return
  }

  // we're working on the assumtion that a dotNet project will only ever have one lock file
  //while other language may have more
  try {
    dotnet.rawLockFileContents = fs.readFileSync(lockFilePath)
  } catch (err) {
    next(
      new Error(i18n.__('dotnetReadLockfile', lockFilePath) + `${err.message}`)
    )

    return
  }

  next()
}
