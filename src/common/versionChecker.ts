import latestVersion from 'latest-version'
import { APP_VERSION } from '../constants/constants'
import boxen from 'boxen'
import chalk from 'chalk'
import semver from 'semver'

export async function findLatestCLIVersion() {
  const latestCLIVersion = await latestVersion('@contrast/contrast')

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

export async function isCorrectNodeVersion(currentVersion: string) {
  return semver.satisfies(currentVersion, '>=16.13.2 <17')
}
