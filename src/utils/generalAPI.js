const { featuresTeamServer } = require('./capabilities')
const semver = require('semver')
const commonApi = require('./commonApi')
const { isNil } = require('lodash')

const getGlobalProperties = async config => {
  const client = commonApi.getHttpClient(config)
  return client
    .getGlobalProperties(config.host)
    .then(res => {
      if (res.statusCode === 200) {
        return res.body
      } else {
        commonApi.handleResponseErrors(res, 'globalProperties')
      }
    })
    .catch(err => {
      console.log(err)
    })
}

const getMode = async config => {
  const features = await getGlobalProperties(config)

  if (!isNil(features?.mode)) {
    return features.mode
  }
  return ''
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
  isFeatureEnabled,
  getMode
}
