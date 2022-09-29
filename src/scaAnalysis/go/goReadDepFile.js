const child_process = require('child_process')
const i18n = require('i18n')

const getGoDependencies = config => {
  let cmdStdout
  let cwd = config.file ? config.file.replace('go.mod', '') : process.cwd()

  try {
    // A sample of this output can be found
    // in the go test folder data/goModGraphResults.text
    cmdStdout = child_process.execSync('go mod graph', { cwd })

    return cmdStdout.toString()
  } catch (err) {
    if (err.message === 'spawnSync /bin/sh ENOENT') {
      err.message =
        '\n\n*************** No transitive dependencies ***************\n\nWe are unable to build a dependency tree view from your repository as there were no transitive dependencies found.'
    }
    console.log(
      i18n.__('goReadProjectFile', cwd, `${err.message ? err.message : ''}`)
    )
    // throw new Error(
    //   i18n.__('goReadProjectFile', cwd, `${err.message ? err.message : ''}`)
    // )
  }
}

module.exports = {
  getGoDependencies
}
