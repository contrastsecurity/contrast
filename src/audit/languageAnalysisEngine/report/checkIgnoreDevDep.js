const {
  getGlobalProperties,
  getFeatures,
  isFeatureEnabled
} = require('../util/generalAPI')
const { CLI_IGNORE_DEV_DEPS } = require('../util/capabilities')

const checkDevDeps = async config => {
  const shouldIgnoreDev = config.ignoreDev
  const globalProperties = await getGlobalProperties()

  // returns [ 'CLI_IGNORE_DEV_DEPS' ] if teamserver version is above 3.8.1
  const features = getFeatures(globalProperties.internal_version)

  // providing user is on version >= 3.8.1, isfeatureEnabled will always return true,
  // therefore shouldIgnoreDev flag (from params) is needed to disable ignore dev deps
  const isfeatureEnabled = isFeatureEnabled(features, CLI_IGNORE_DEV_DEPS)
  let ignoreDevUrl = false
  if (shouldIgnoreDev) {
    ignoreDevUrl = isfeatureEnabled
  }
  return ignoreDevUrl
}

module.exports = {
  checkDevDeps
}
