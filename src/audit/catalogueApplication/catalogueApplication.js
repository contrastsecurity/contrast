const { getHttpClient, handleResponseErrors } = require('../../utils/commonApi')

const catalogueApplication = async config => {
  const client = getHttpClient(config)
  let appId
  await client
    .catalogueCommand(config)
    .then(res => {
      if (res.statusCode === 201) {
        //displaySuccessMessage(config, res.body.application.app_id)
        appId = res.body.application.app_id
      } else if (doesMessagesContainAppId(res)) {
        appId = tryRetrieveAppIdFromMessages(res.body.messages)
      } else {
        handleResponseErrors(res, 'catalogue')
      }
    })
    .catch(err => {
      console.log(err)
    })
  return appId
}

const doesMessagesContainAppId = res => {
  const regex = /(Application ID =)/
  if (
    res.statusCode === 400 &&
    res.body.messages.filter(message => regex.exec(message))[0]
  ) {
    return true
  }

  return false
}

const tryRetrieveAppIdFromMessages = messages => {
  let appId
  messages.forEach(message => {
    if (message.includes('Application ID')) {
      appId = message.split('=')[1].replace(/\s+/g, '')
    }
  })

  return appId
}

module.exports = {
  catalogueApplication: catalogueApplication,
  doesMessagesContainAppId,
  tryRetrieveAppIdFromMessages
}
