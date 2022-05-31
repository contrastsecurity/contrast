const fs = require('fs')
const i18n = require('i18n')

module.exports = exports = ({ language: { lockFilePath }, php }, next) => {
  try {
    php.rawLockFileContents = JSON.parse(fs.readFileSync(lockFilePath))
  } catch (err) {
    next(new Error(i18n.__('phpReadError', lockFilePath) + `${err.message}`))

    return
  }

  next()
}
