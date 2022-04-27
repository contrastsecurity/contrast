'use strict'
const fs = require('fs')
const yaml = require('js-yaml')
const getAuth = yamlPath => {
  const yamlParams = yaml.load(fs.readFileSync(yamlPath, 'utf8'))
}
