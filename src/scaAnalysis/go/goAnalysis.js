const { createGoTSMessage } = require('../common/formatMessage')
const {
  parseDependenciesForSCAServices
} = require('../common/scaParserForGoAndJava')
const goReadDepFile = require('./goReadDepFile')
const goParseDeps = require('./goParseDeps')

const goAnalysis = config => {
  try {
    const rawGoDependencies = goReadDepFile.getGoDependencies(config)
    const parsedGoDependencies =
      goParseDeps.parseGoDependencies(rawGoDependencies)

    if (config.experimental) {
      return parseDependenciesForSCAServices(parsedGoDependencies)
    } else {
      return createGoTSMessage(parsedGoDependencies)
    }
  } catch (e) {
    console.log(e.message.toString())
  }
}

module.exports = {
  goAnalysis
}
