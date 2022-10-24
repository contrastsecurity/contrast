const catalogue = require('../../audit/catalogueApplication/catalogueApplication')
const commonApi = require('../../audit/languageAnalysisEngine/commonApi')

const dealWithNoAppId = async config => {
  let appID
  try {
    appID = await commonApi.returnAppId(config)

    if (!appID && config.applicationName) {
      return await catalogue.catalogueApplication(config)
    }

    if (!appID && !config.applicationName) {
      config.applicationName = getAppName(config.file)
      appID = await commonApi.returnAppId(config)

      if (!appID) {
        return await catalogue.catalogueApplication(config)
      }
    }
  } catch (e) {
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

const getAppName = file => {
  const last = file.charAt(file.length - 1)
  if (last !== '/') {
    return file.split('/').pop()
  } else {
    const str = removeLastChar(file)
    return str.split('/').pop()
  }
}

const removeLastChar = str => {
  return str.substring(0, str.length - 1)
}

module.exports = {
  dealWithNoAppId
}
