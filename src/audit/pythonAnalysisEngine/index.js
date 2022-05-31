const AnalysisEngine = require('./../AnalysisEngine')

const readPythonProjectFileContents = require('./readPythonProjectFileContents')
const readPipfileLockFileContents = require('./readPipfileLockFileContents')
const parseProjectFileContents = require('./parseProjectFileContents')
const parsePipfileLockContents = require('./parsePipfileLockContents')
const sanitizer = require('./sanitizer')
const i18n = require('i18n')

module.exports = exports = (language, config, callback) => {
  const ae = new AnalysisEngine({ language, config, python: {} })

  // python's dependancy management is a bit of a wild west.

  // in general there is a requirements.txt but there can also be a test-requirements.txt
  // and/or dev-requirements.txt. plus the versions in all of those files do not need
  // to be specified meaning that when the file is run it can have different dependancies
  // per environment. If the user runs pip freeze it updates the requirements to the exact
  // versions running in their local solo environment. We might need to do this or get the
  // customer to do this for more accurate results.

  // pip has a ultility module that can be run pipdeptree that will give a dependancy tree
  // but this is a package that needs to be installed.

  // there is also pipenv that produces pipfile and pipfile.lock that helps managed dependancies
  // to be the same across all the environements. if pipfile.lock is found as well as a requirements.txt
  // then pipfile.lock superceeds the requirements.

  // pipenv graph can create a dependancy tree but to run that we have to
  // 1) know if pipenv is used to manage python env
  // 2) what the name of their pipenv is called
  // 3) run the command
  // 4)scrape and parse the console output

  // For a breakdown of more python packaging https://realpython.com/pipenv-guide/ is a good guide
  // and https://medium.com/python-pandemonium/better-python-dependency-and-package-management-b5d8ea29dff1

  ae.use([
    readPythonProjectFileContents,
    parseProjectFileContents,
    readPipfileLockFileContents,
    parsePipfileLockContents,
    sanitizer
  ])

  ae.analyze((err, analysis) => {
    if (err) {
      callback(
        new Error(i18n.__('pythonAnalysisEngineError') + `${err.message}`)
      )
      return
    }
    callback(null, analysis)
  })
}
