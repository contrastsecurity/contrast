const i18n = require('i18n')
const { getHttpClient, handleResponseErrors } = require('../../utils/commonApi')

const locationOfApp = (config, appId) => {
  return `${config.host}/Contrast/static/ng/index.html#/${config.organizationId}/applications/${appId}`
}

const displaySuccessMessage = (config, appId) => {
  console.log(
    '\n **************************' +
      i18n.__('successHeader') +
      '************************** \n'
  )
  console.log('\n' + i18n.__('catalogueSuccessCommand') + appId + '\n')
  console.log(locationOfApp(config, appId))
  console.log(
    '\n *********************************************************** \n'
  )
}

const catalogueApplication = async config => {
  const client = getHttpClient(config)
  let appId
  await client
    .catalogueCommand(config)
    .then(res => {
      if (res.statusCode === 201) {
        displaySuccessMessage(config, res.body.application.app_id)
        appId = res.body.application.app_id
      } else {
        handleResponseErrors(res, 'catalogue')
      }
    })
    .catch(err => {
      console.log(err)
    })
  return appId
}

module.exports = {
  catalogueApplication: catalogueApplication
}
