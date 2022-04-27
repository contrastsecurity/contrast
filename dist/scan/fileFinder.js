'use strict'
const fg = require('fast-glob')
const i18n = require('i18n')
const findFile = async () => {
  console.log(i18n.__('searchingScanFileDirectory', process.cwd()))
  const entries = fg(['**/*.jar', '**/*.war', '**/*.zip', '**/*.dll'], {
    dot: false,
    deep: 3,
    onlyFiles: true
  })
  return entries
}
module.exports = {
  findFile
}
