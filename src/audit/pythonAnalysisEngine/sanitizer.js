module.exports = exports = ({ python }, next) => {
  // Remove anything sensitive or unnecessary from being sent to the backend as
  // a result of our Python project analysis
  delete python.rawProjectFileContents
  delete python.rawLockFileContents
  delete python.pipfileLock.default

  next()
}
