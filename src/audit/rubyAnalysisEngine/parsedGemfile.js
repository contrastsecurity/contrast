const i18n = require('i18n')

module.exports = exports = ({ ruby }, next) => {
  const { rawProjectFileContents } = ruby

  // Read the ruby requirements file contents.

  try {
    const rubyArray = rawProjectFileContents.split('\n')

    //give me the gemfiles
    let filteredRubyDep = rubyArray.filter(element => {
      return (
        !element.includes('#') &&
        element.includes('gem') &&
        !element.includes('source')
      )
    })

    //trim off whitespace
    for (let i = 0; i < filteredRubyDep.length; i++) {
      filteredRubyDep[i] = filteredRubyDep[i].trim()
    }

    ruby.gemfilesDependanceies = filteredRubyDep

    next()
  } catch (err) {
    next(
      new Error(
        i18n.__(
          'rubyAnalysisEngineParsedGemFileError',
          rawProjectFileContents
        ) + `${err.message}`
      )
    )
    return
  }
}
