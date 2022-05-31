module.exports = exports = ({ ruby }, next) => {
  // Remove anything sensitive or unnecessary from being sent to the backend as
  // a result of our Ruby project analysis
  delete ruby.rawProjectFileContents
  delete ruby.rawLockFileContents

  next()
}
