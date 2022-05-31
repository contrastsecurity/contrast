const fs = require('fs')
const i18n = require('i18n')
// all node references are because we're using that engine in the backend
// so complying with the already existing node format
module.exports = exports = (analysis, next) => {
  const {
    language: { projectFilePath },
    php
  } = analysis

  try {
    php.composerJSON = JSON.parse(fs.readFileSync(projectFilePath, 'utf8'))
    php.composerJSON.dependencies = php.composerJSON.require
    php.composerJSON.devDependencies = php.composerJSON['require-dev']
  } catch (err) {
    next(
      new Error(
        i18n.__('phpReadProjectFileError', projectFilePath) + `${err.message}`
      )
    )
    return
  }

  next()
}
