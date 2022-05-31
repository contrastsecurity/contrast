const child_process = require('child_process')
const i18n = require('i18n')

module.exports = exports = async (
  { language: { projectFilePath }, go },
  next
) => {
  let cmdStdout
  let cwd
  try {
    cwd = projectFilePath.replace('go.mod', '')
    // A sample of this output can be found
    // in the go test folder data/goModGraphResults.text
    cmdStdout = child_process.execSync('go mod graph', { cwd })

    go.modGraphOutput = cmdStdout.toString()

    next()
  } catch (err) {
    if (err.message === 'spawnSync /bin/sh ENOENT') {
      err.message =
        '\n\n*************** No transitive dependencies ***************\n\nWe are unable to build a dependency tree view from your repository as there were no transitive dependencies found.'
    }
    next(
      new Error(
        i18n.__('goReadProjectFile', cwd, `${err.message ? err.message : ''}`)
      )
    )
    return
  }
}
