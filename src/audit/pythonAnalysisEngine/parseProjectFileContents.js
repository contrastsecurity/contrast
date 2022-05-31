const multiReplace = require('string-multiple-replace')
const i18n = require('i18n')

module.exports = exports = ({ python }, next) => {
  const { rawProjectFileContents } = python

  try {
    const matcherObj = { '"': '' }
    const sequencer = ['"']
    const parsedPipfile = multiReplace(
      rawProjectFileContents,
      matcherObj,
      sequencer
    )

    const pythonArray = parsedPipfile.split('\n')

    python.pipfilDependanceies = pythonArray.filter(element => {
      return element != '' && !element.includes('#')
    })

    next()
  } catch (err) {
    next(
      new Error(
        i18n.__('pythonAnalysisParseProjectFileError', rawProjectFileContents) +
          `${err.message}`
      )
    )

    return
  }
}
