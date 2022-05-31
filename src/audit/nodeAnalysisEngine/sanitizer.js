module.exports = exports = ({ node }, next) => {
  // Remove anything sensitive or unnecessary from being sent to the backend as
  // a result of our NODE project analysis
  delete node.rawProjectFileContents
  delete node.projectFileJSON
  delete node.projectLockFileJSON
  delete node.rawLockFileContents
  delete node.rawYarnLockFileContents

  next()
}
