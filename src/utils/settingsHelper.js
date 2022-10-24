const commonApi = require('./commonApi')
const { getMode } = require('./generalAPI')
const { SAAS, MODE_BUILD } = require('../constants/constants')

const getSettings = async config => {
  config.isEOP = (await getMode(config)).toUpperCase() === SAAS ? false : true
  config.mode = MODE_BUILD
  config.scaServices = await isSCAServicesAvailable(config)
  return config
}

const isSCAServicesAvailable = async config => {
  const client = commonApi.getHttpClient(config)
  return client
    .scaServiceIngests(config)
    .then(res => {
      return res.statusCode !== 403
    })
    .catch(err => {
      console.log(err)
    })
}

module.exports = {
  getSettings
}
