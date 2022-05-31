const { getHttpClient } = require('../../utils/commonApi')

const returnAppId = async config => {
  const client = getHttpClient(config)
  let appId

  await client.getAppId(config).then(res => {
    if (res.body) {
      let obj = res.body['applications']
      if (obj) {
        appId = obj.length === 0 ? '' : obj[0].app_id
      }
    }
  })
  return appId
}

module.exports = {
  returnAppId: returnAppId
}
