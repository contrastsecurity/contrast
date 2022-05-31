import { catalogueApplication } from '../../audit/catalogueApplication/catalogueApplication'
import commonApi from '../../audit/languageAnalysisEngine/commonApi'
const identifyLanguageAE = require('./../../audit/languageAnalysisEngine')
const languageFactory = require('./../../audit/languageAnalysisEngine/langugageAnalysisFactory')

const dealWithNoAppId = async (config: { [x: string]: string }) => {
  let appID
  try {
    appID = await commonApi.returnAppId(config)
    if (!appID && config.applicationName) {
      return await catalogueApplication(config)
    }
  } catch (e) {
    console.log(e)
  }
  console.log(appID)
  return appID
}

export const startAudit = async (config: { [key: string]: string }) => {
  if (!config.applicationId) {
    // @ts-ignore
    config.applicationId = await dealWithNoAppId(config)
  }
  identifyLanguageAE(
    config.projectPath,
    languageFactory,
    config.applicationId,
    config
  )
}
