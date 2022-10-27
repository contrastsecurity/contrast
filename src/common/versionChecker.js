const { APP_VERSION } = require('../constants/constants')
const boxen = require('boxen')
const chalk = require('chalk')
const semver = require('semver')
const commonApi = require('../utils/commonApi')
const { constants } = require('http2')

const getLatestVersion = async config => {
  const client = commonApi.getHttpClient(config)
  try {
    const res = await client.getLatestVersion()
    if (res.statusCode === constants.HTTP_STATUS_OK) {
      return res.body
    }
  } catch (e) {
    return undefined
  }
}

const findLatestCLIVersion = async config => {
  const isCI = process.env.CONTRAST_CODESEC_CI
    ? JSON.parse(process.env.CONTRAST_CODESEC_CI.toLowerCase())
    : false

  if (!isCI) {
    let latestCLIVersion = await getLatestVersion(config)

    if (latestCLIVersion === undefined) {
      config.set('numOfRuns', 0)
      console.log(
        'Failed to retrieve latest version info. Continuing execution.'
      )
      return
    }

    //strip key and remove new lines
    latestCLIVersion = latestCLIVersion.substring(8).replace('\n', '')

    if (semver.lt(APP_VERSION, latestCLIVersion)) {
      const updateAvailableMessage = `Update available ${chalk.yellow(
        APP_VERSION
      )} → ${chalk.green(latestCLIVersion)}`

      const npmUpdateAvailableCommand = `Run ${chalk.cyan(
        'npm i @contrast/contrast -g'
      )} to update via npm`

      const homebrewUpdateAvailableCommand = `Run ${chalk.cyan(
        'brew install contrastsecurity/tap/contrast'
      )} to update via brew`

      console.log(
        boxen(
          `${updateAvailableMessage}\n${npmUpdateAvailableCommand}\n\n${homebrewUpdateAvailableCommand}`,
          {
            titleAlignment: 'center',
            margin: 1,
            padding: 1,
            align: 'center'
          }
        )
      )
    }
  }
}

const isCorrectNodeVersion = async currentVersion => {
  return semver.satisfies(currentVersion, '>=16')
}

module.exports = {
  getLatestVersion,
  findLatestCLIVersion,
  isCorrectNodeVersion
}
