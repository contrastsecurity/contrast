const { createPythonTSMessage } = require('../common/formatMessage')
const { getPythonDeps, secondaryParser } = require('./analysis')

const pythonAnalysis = (config, languageFiles) => {
  const pythonDeps = getPythonDeps(config, languageFiles.PYTHON)

  if (config.experimental) {
    return pythonDeps
  } else {
    return createPythonTSMessage(pythonDeps)
  }
}

module.exports = {
  pythonAnalysis
}
