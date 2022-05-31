module.exports = exports = ({ php }, next) => {
  delete php.rawLockFileContents
  next()
}
