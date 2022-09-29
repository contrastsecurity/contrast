const autoDetection = require('../../../scan/autoDetection')
const javaAnalysis = require('../../../scaAnalysis/java')
const treeUpload = require('../../../scaAnalysis/common/treeUpload')
const auditController = require('../../audit/auditController')
const {
  supportedLanguages: { JAVA, GO, PYTHON, RUBY, JAVASCRIPT, NODE, PHP, DOTNET }
} = require('../../../constants/constants')
const goAnalysis = require('../../../scaAnalysis/go/goAnalysis')
const phpAnalysis = require('../../../scaAnalysis/php/index')
const { rubyAnalysis } = require('../../../scaAnalysis/ruby')
const { pythonAnalysis } = require('../../../scaAnalysis/python')
const javascriptAnalysis = require('../../../scaAnalysis/javascript')
const {
  pollForSnapshotCompletition
} = require('../../../audit/languageAnalysisEngine/sendSnapshot')
const {
  returnOra,
  startSpinner,
  succeedSpinner
} = require('../../../utils/oraWrapper')
const i18n = require('i18n')
const {
  vulnerabilityReportV2
} = require('../../../audit/report/reportingFeature')
const auditSave = require('../../../audit/save')
const { dotNetAnalysis } = require('../../../scaAnalysis/dotnet')
const { auditUsageGuide } = require('../../audit/help')
const rootFile = require('../../../audit/languageAnalysisEngine/getProjectRootFilenames')
const path = require('path')
const generalAPI = require('../../../utils/generalAPI')

const processSca = async config => {
  config.mode = await generalAPI.getMode(config)

  const startTime = performance.now()
  let filesFound

  if (config.help) {
    console.log(auditUsageGuide)
    process.exit(0)
  }

  const projectStats = await rootFile.getProjectStats(config.file)
  let pathWithFile = projectStats.isFile()

  config.fileName = config.file
  config.file = pathWithFile
    ? rootFile.getDirectoryFromPathGiven(config.file).concat('/')
    : config.file

  filesFound = await autoDetection.autoDetectAuditFilesAndLanguages(config.file)

  if (filesFound.length > 1 && pathWithFile) {
    filesFound = filesFound.filter(i =>
      Object.values(i)[0].includes(path.basename(config.fileName))
    )
  }

  // files found looks like [ { javascript: [ Array ] } ]
  //check we have the language and call the right analyser
  //refactor new analyser and see if we can clean it up
  let messageToSend = undefined
  if (filesFound.length === 1) {
    switch (Object.keys(filesFound[0])[0]) {
      case JAVA:
        messageToSend = javaAnalysis.javaAnalysis(config, filesFound[0])
        config.language = JAVA
        break
      case JAVASCRIPT:
        messageToSend = await javascriptAnalysis.jsAnalysis(
          config,
          filesFound[0]
        )
        config.language = NODE
        break
      case PYTHON:
        messageToSend = pythonAnalysis(config, filesFound[0])
        config.language = PYTHON
        break
      case RUBY:
        messageToSend = rubyAnalysis(config, filesFound[0])
        config.language = RUBY
        break
      case PHP:
        messageToSend = phpAnalysis.phpAnalysis(config, filesFound[0])
        config.language = PHP
        break
      case GO:
        messageToSend = goAnalysis.goAnalysis(config, filesFound[0])
        config.language = GO
        break
      case DOTNET:
        messageToSend = dotNetAnalysis(config, filesFound[0])
        config.language = DOTNET
        break
      default:
        //something is wrong
        console.log('No supported language detected in project path')
        return
    }

    if (!config.applicationId) {
      config.applicationId = await auditController.dealWithNoAppId(config)
    }

    // if (config.experimental) {
    //   // const reports = await scaUpload.scaTreeUpload(messageToSend, config)
    //   auditReport.processAuditReport(config, 'reports')
    // } else {
    console.log('') //empty log for space before spinner
    //send message to TS
    const reportSpinner = returnOra(i18n.__('auditSCAAnalysisBegins'))
    startSpinner(reportSpinner)
    const snapshotResponse = await treeUpload.commonSendSnapShot(
      messageToSend,
      config
    )

    //poll for completion
    await pollForSnapshotCompletition(
      config,
      snapshotResponse.id,
      reportSpinner
    )
    succeedSpinner(reportSpinner, i18n.__('auditSCAAnalysisComplete'))

    await vulnerabilityReportV2(config, snapshotResponse.id)
    if (config.save !== undefined) {
      await auditSave.auditSave(config)
    }
    const endTime = performance.now() - startTime
    const scanDurationMs = endTime - startTime

    console.log(
      `----- completed in ${(scanDurationMs / 1000).toFixed(2)}s -----`
    )
    // }
  } else {
    if (filesFound.length === 0) {
      console.log(i18n.__('languageAnalysisNoLanguage'))
      console.log(i18n.__('languageAnalysisNoLanguageHelpLine'))
      throw new Error()
    } else {
      throw new Error(
        `multiple language files detected \n` +
          JSON.stringify(filesFound) +
          `\nplease use --file to audit one language only. Example: contrast audit --file package-lock.json`
      )
    }
  }
}

module.exports = {
  processSca
}
