import { catalogueApplication } from '../../audit/catalogueApplication/catalogueApplication'
import commonApi from '../../audit/languageAnalysisEngine/commonApi'

export const dealWithNoAppId = async (config: { [x: string]: string }) => {
  let appID: string
  try {
    // @ts-ignore
    appID = await commonApi.returnAppId(config)
    if (!appID && config.applicationName) {
      return await catalogueApplication(config)
    }
    if (!appID && !config.applicationName) {
      config.applicationName = getAppName(config.file) as string
      // @ts-ignore
      appID = await commonApi.returnAppId(config)
      if (!appID) {
        return await catalogueApplication(config)
      }
    }
  } catch (e: any) {
    if (e.toString().includes('tunneling socket could not be established')) {
      console.log(e.message.toString())
      console.log(
        'There seems to be an issue with your proxy, please check and try again'
      )
    }
    process.exit(1)
  }
  return appID
}

export const getAppName = (file: string) => {
  const last = file.charAt(file.length - 1)
  if (last !== '/') {
    return file.split('/').pop()
  } else {
    const str = removeLastChar(file)
    return str.split('/').pop()
  }
}

const removeLastChar = (str: string) => {
  return str.substring(0, str.length - 1)
}
