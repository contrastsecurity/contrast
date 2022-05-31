const i18n = require('i18n')

module.exports = exports = ({ language: { lockFilePath }, python }, next) => {
  if (python.rawLockFileContents === undefined) {
    return next()
  }
  try {
    let parsedPipLock = JSON.parse(python.rawLockFileContents)
    parsedPipLock['defaults'] = parsedPipLock['default']
    python.pipfileLock = parsedPipLock
  } catch (err) {
    next(
      new Error(
        i18n.__(
          'pythonAnalysisEnginePipError',
          lockFilePath ? lockFilePath : 'undefined'
        ) + `${err.message}`
      )
    )
    return
  }
  next()
}
