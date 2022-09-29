const { getDotNetDeps } = require('./analysis')
const { createDotNetTSMessage } = require('../common/formatMessage')

const dotNetAnalysis = (config, languageFiles) => {
  const dotNetDeps = getDotNetDeps(config.file, languageFiles.DOTNET)
  return createDotNetTSMessage(dotNetDeps)
}

module.exports = {
  dotNetAnalysis
}
