const analysis = require('./analysis')
const { createRubyTSMessage } = require('../common/formatMessage')

const rubyAnalysis = (config, languageFiles) => {
  const rubyDeps = analysis.getRubyDeps(config, languageFiles.RUBY)

  if (config.experimental) {
    return rubyDeps
  } else {
    return createRubyTSMessage(rubyDeps)
  }
}

module.exports = {
  rubyAnalysis
}
