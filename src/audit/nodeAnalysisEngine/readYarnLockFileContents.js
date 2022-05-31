const fs = require('fs')
const yaml = require('js-yaml')
const i18n = require('i18n')

module.exports = exports = ({ language: { lockFilePath }, node }, next) => {
  // check if the lockFilePath is populated and if it is check to
  // see if it has the package-lock if not then go on to next handler
  if (!lockFilePath || !lockFilePath.includes('yarn.lock')) {
    next()
    return
  }

  try {
    node.rawYarnLockFileContents = fs.readFileSync(lockFilePath, 'utf8')
    node.yarnVersion = 1

    if (
      !node.rawYarnLockFileContents.includes('lockfile v1') ||
      node.rawYarnLockFileContents.includes('__metadata')
    ) {
      node.rawYarnLockFileContents = yaml.load(
        fs.readFileSync(lockFilePath, 'utf8')
      )
      node.yarnVersion = 2
    }
  } catch (err) {
    next(
      new Error(
        i18n.__('nodeReadYarnLockFileError', lockFilePath) + `${err.message}`
      )
    )

    return
  }
  next()
}
