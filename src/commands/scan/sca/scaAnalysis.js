const {
  supportedLanguages: { JAVA, GO, PYTHON, RUBY, JAVASCRIPT, NODE, PHP, DOTNET }
} = require('../../../constants/constants')
const {
  pollForSnapshotCompletion
} = require('../../../audit/languageAnalysisEngine/sendSnapshot')
const {
  returnOra,
  startSpinner,
  succeedSpinner
} = require('../../../utils/oraWrapper')
const {
  vulnerabilityReportV2
} = require('../../../audit/report/reportingFeature')
const autoDetection = require('../../../scan/autoDetection')
const treeUpload = require('../../../scaAnalysis/common/treeUpload')
const auditController = require('../../audit/auditController')
const rootFile = require('../../../audit/languageAnalysisEngine/getProjectRootFilenames')
const path = require('path')
const i18n = require('i18n')
const auditSave = require('../../../audit/save')
const { auditUsageGuide } = require('../../audit/help')
const repoMode = require('../../../scaAnalysis/repoMode/index')
const { dotNetAnalysis } = require('../../../scaAnalysis/dotnet')
const { goAnalysis } = require('../../../scaAnalysis/go/goAnalysis')
const { phpAnalysis } = require('../../../scaAnalysis/php/index')
const { rubyAnalysis } = require('../../../scaAnalysis/ruby')
const { pythonAnalysis } = require('../../../scaAnalysis/python')
const javaAnalysis = require('../../../scaAnalysis/java')
const jsAnalysis = require('../../../scaAnalysis/javascript')
const auditReport = require('../../../scaAnalysis/common/auditReport')
const scaUpload = require('../../../scaAnalysis/common/scaServicesUpload')
const settingsHelper = require('../../../utils/settingsHelper')
const chalk = require('chalk')
const saveResults = require('../../../scan/saveResults')

const processSca = async config => {
  //checks to see whether to use old TS / new SCA path
  config = await settingsHelper.getSettings(config)

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

  if (config.fingerprint && config.experimental) {
    let fingerprint = await autoDetection.autoDetectFingerprintInfo(config.file)
    let idArray = fingerprint.map(x => x.id)
    await saveResults.writeResultsToFile(fingerprint, 'fingerPrintInfo.json')
    console.log(idArray)
  } else {
    filesFound = await autoDetection.autoDetectAuditFilesAndLanguages(
      config.file
    )

    if (filesFound.length > 1 && pathWithFile) {
      filesFound = filesFound.filter(i =>
        Object.values(i)[0].includes(path.basename(config.fileName))
      )
    }

    // files found looks like [ { javascript: [ Array ] } ]
    //check we have the language and call the right analyser
    let messageToSend = undefined
    if (filesFound.length === 1) {
      switch (Object.keys(filesFound[0])[0]) {
        case JAVA:
          config.language = JAVA

          if (config.mode === 'repo') {
            try {
              return repoMode.buildRepo(config, filesFound[0])
            } catch (e) {
              throw new Error(
                'Unable to build in repository mode. Check your project file'
              )
            }
          } else {
            messageToSend = await javaAnalysis.javaAnalysis(
              config,
              filesFound[0]
            )
          }
          break
        case JAVASCRIPT:
          messageToSend = await jsAnalysis.jsAnalysis(config, filesFound[0])
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
          messageToSend = phpAnalysis(config, filesFound[0])
          config.language = PHP
          break
        case GO:
          messageToSend = goAnalysis(config, filesFound[0])
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

      if (config.experimental) {
        console.log('') //empty log for space before spinner
        const reportSpinner = returnOra(i18n.__('auditSCAAnalysisBegins'))
        startSpinner(reportSpinner)
        const [reports, reportId] = await scaUpload.scaTreeUpload(
          messageToSend,
          config
        )

        auditReport.processAuditReport(config, reports[0])
        succeedSpinner(reportSpinner, i18n.__('auditSCAAnalysisComplete'))

        if (config.save !== undefined) {
          await auditSave.auditSave(config, reportId)
        } else {
          console.log('Use contrast audit --save to generate an SBOM')
        }

        const endTime = performance.now() - startTime
        const scanDurationMs = endTime - startTime
        console.log(
          `----- completed in ${(scanDurationMs / 1000).toFixed(2)}s -----`
        )
      } else {
        console.log('') //empty log for space before spinner
        //send message to TS
        const reportSpinner = returnOra(i18n.__('auditSCAAnalysisBegins'))
        startSpinner(reportSpinner)
        const snapshotResponse = await treeUpload.commonSendSnapShot(
          messageToSend,
          config
        )

        // poll for completion
        await pollForSnapshotCompletion(
          config,
          snapshotResponse.id,
          reportSpinner
        )
        succeedSpinner(reportSpinner, i18n.__('auditSCAAnalysisComplete'))

        await vulnerabilityReportV2(config, snapshotResponse.id)
        if (config.save !== undefined) {
          await auditSave.auditSave(config)
        } else {
          console.log('\nUse contrast audit --save to generate an SBOM')
        }
        const endTime = performance.now() - startTime
        const scanDurationMs = endTime - startTime

        console.log(
          `----- completed in ${(scanDurationMs / 1000).toFixed(2)}s -----`
        )
      }
    } else {
      if (filesFound.length === 0) {
        console.log(i18n.__('languageAnalysisNoLanguage'))
        console.log(i18n.__('languageAnalysisNoLanguageHelpLine'))
        throw new Error()
      } else {
        console.log(chalk.bold(`\nMultiple language files detected \n`))
        filesFound.forEach(file => {
          console.log(`${Object.keys(file)[0]} : `, Object.values(file)[0])
        })
        throw new Error(
          `Please use --file to audit one language only. \nExample: contrast audit --file package-lock.json`
        )
      }
    }
  }
}

module.exports = {
  processSca
}
