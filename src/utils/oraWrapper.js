const ora = require('ora')

const returnOra = text => {
  return ora(text)
}

const startSpinner = spinner => {
  spinner.start()
}

const stopSpinner = spinner => {
  spinner.stop()
}

const succeedSpinner = (spinner, text) => {
  spinner.succeed(text)
}

const failSpinner = (spinner, text) => {
  spinner.fail(text)
}

module.exports = {
  returnOra,
  startSpinner,
  succeedSpinner,
  failSpinner,
  stopSpinner
}
