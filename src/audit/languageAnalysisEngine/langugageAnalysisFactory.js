const {
  supportedLanguages: { DOTNET, NODE, JAVA, RUBY, PYTHON, GO, PHP }
} = require('../languageAnalysisEngine/constants')
const i18n = require('i18n')
const dotnetAE = require('../dotnetAnalysisEngine')
const nodeAE = require('../nodeAnalysisEngine')
const javaAE = require('../javaAnalysisEngine')
const rubyAE = require('../rubyAnalysisEngine')
const pythonAE = require('../pythonAnalysisEngine')
const phpAE = require('../phpAnalysisEngine')
const goAE = require('../goAnalysisEngine')
const { vulnerabilityReport } = require('./report/reportingFeature')
const { vulnReportWithoutDevDep } = require('./report/newReportingFeature')
const { checkDevDeps } = require('./report/checkIgnoreDevDep')
const { newSendSnapShot } = require('../languageAnalysisEngine/sendSnapshot')
const fs = require('fs')
const chalk = require('chalk')
const saveFile = require('../../commands/audit/saveFile').default
const generateSbom = require('../../sbom/generateSbom').default

module.exports = exports = (err, analysis) => {
  const { identifiedLanguageInfo } = analysis.languageAnalysis
  const catalogueAppId = analysis.languageAnalysis.appId

  if (err) {
    console.error(err)
    return
  }

  // this callback is the end of the chain
  const langCallback = async (err, analysis) => {
    const config = analysis.config
    if (err) {
      console.log()
      console.log(
        '***********' +
          i18n.__('languageAnalysisFactoryFailureHeader') +
          '****************'
      )
      console.log(identifiedLanguageInfo.language)
      console.log()
      console.error(
        `${identifiedLanguageInfo.language}` +
          i18n.__('languageAnalysisFailure') +
          err
      )
      return process.exit(5)
    }

    console.log('\n **************CONTRAST OSS ANALYSIS BEGINS**************')
    const snapshotResponse = await newSendSnapShot(analysis, catalogueAppId)

    if (config.report) {
      const ignoreDevUrl = await checkDevDeps(config)
      if (ignoreDevUrl) {
        await vulnReportWithoutDevDep(
          analysis,
          catalogueAppId,
          snapshotResponse.id,
          config
        )
      } else {
        await vulnerabilityReport(analysis, catalogueAppId, config)
      }
    }

    //should be moved to processAudit.ts once promises implemented
    await auditSave(config)

    console.log(
      '\n ***************CONTRAST OSS ANALYSIS COMPLETE************** \n'
    )
  }

  if (identifiedLanguageInfo.language === DOTNET) {
    dotnetAE(identifiedLanguageInfo, analysis.config, langCallback)
  }

  if (identifiedLanguageInfo.language === NODE) {
    nodeAE(identifiedLanguageInfo, analysis.config, langCallback)
  }

  if (identifiedLanguageInfo.language === JAVA) {
    javaAE(identifiedLanguageInfo, analysis.config, langCallback)
  }

  if (identifiedLanguageInfo.language === RUBY) {
    rubyAE(identifiedLanguageInfo, analysis.config, langCallback)
  }

  if (identifiedLanguageInfo.language === PYTHON) {
    pythonAE(identifiedLanguageInfo, analysis.config, langCallback)
  }

  if (identifiedLanguageInfo.language === PHP) {
    phpAE(identifiedLanguageInfo, analysis.config, langCallback)
  }

  if (identifiedLanguageInfo.language === GO) {
    goAE(identifiedLanguageInfo, analysis.config, langCallback)
  }
}

async function auditSave(config) {
  //should be moved to processAudit.ts once promises implemented
  if (config.save) {
    if (config.save.toLowerCase() === 'sbom') {
      saveFile(config, await generateSbom(config))

      const filename = `${config.applicationId}-sbom-cyclonedx.json`
      if (fs.existsSync(filename)) {
        console.log(i18n.__('auditSBOMSaveSuccess') + ` - ${filename}`)
      } else {
        console.log(
          chalk.yellow.bold(
            `\n Unable to save ${filename} Software Bill of Materials (SBOM)`
          )
        )
      }
    } else {
      console.log(i18n.__('auditBadFiletypeSpecifiedForSave'))
    }
  } else {
    console.log(i18n.__('auditNoFiletypeSpecifiedForSave'))
  }
}
