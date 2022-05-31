const { featuresTeamServer } = require('./capabilities')
const semver = require('semver')
const { handleResponseErrors } = require('../../../common/errorHandling')
const { getHttpClient } = require('../../../utils/commonApi')

const getGlobalProperties = async config => {
  const client = getHttpClient(config)

  return client
    .getGlobalProperties(config)
    .then(res => {
      if (res.statusCode === 200) {
        return res.body
      } else {
        handleResponseErrors(res, 'globalProperties')
      }
    })
    .catch(err => {
      console.log(err)
    })
}

const getFeatures = version => {
  const featuresEnabled = []

  featuresTeamServer.forEach(feature => {
    const versionFrom = Object.values(feature)[0]
    return semver.gte(version, versionFrom)
      ? featuresEnabled.push(Object.keys(feature)[0])
      : null
  })
  return featuresEnabled
}

const isFeatureEnabled = (features, featureName) => {
  return features.includes(featureName)
}

module.exports = {
  getGlobalProperties,
  getFeatures,
  isFeatureEnabled
}
