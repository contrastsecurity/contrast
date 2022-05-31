const prettyjson = require('prettyjson')
const i18n = require('i18n')
const { getHttpClient } = require('../../utils/commonApi')
const { handleResponseErrors } = require('../../common/errorHandling')
const { APP_VERSION } = require('../../constants/constants')

function displaySnapshotSuccessMessage(config) {
  console.log(
    '\n **************************' +
      i18n.__('successHeader') +
      '************************** '
  )
  console.log('\n' + i18n.__('snapshotSuccessMessage') + '\n')
  console.log(
    ` ${config.host}/Contrast/static/ng/index.html#/${config.organizationId}/applications/${config.applicationId}/libs/dependency-tree`
  )
  console.log('\n ***********************************************************')
}

const newSendSnapShot = async (analysis, applicationId) => {
  const analysisLanguage = analysis.config.language.toLowerCase()
  const requestBody = {
    appID: analysis.config.applicationId,
    cliVersion: APP_VERSION,
    snapshot: { [analysisLanguage]: analysis[analysisLanguage] }
  }

  const client = getHttpClient(analysis.config)

  return client
    .sendSnapshot(requestBody, analysis.config)
    .then(res => {
      // if (!analysis.config.silent) {
      //   console.log(prettyjson.render(requestBody))
      // }
      if (res.statusCode === 201) {
        displaySnapshotSuccessMessage(analysis.config)
        return res.body
      } else {
        handleResponseErrors(res, 'snapshot')
      }
    })
    .catch(err => {
      console.log(err)
    })
}

module.exports = {
  newSendSnapShot: newSendSnapShot,
  displaySnapshotSuccessMessage: displaySnapshotSuccessMessage
}
