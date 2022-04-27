const ora = require('ora')

const returnOra = text => {
  return ora(text)
}

const startSpinner = spinner => {
  spinner.start()
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
  failSpinner
}
