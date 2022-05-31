const fs = require('fs')
const path = require('path')
const i18n = require('i18n')
/**
 * Will get the filenames from the project path provided to the SCA CLI tool. If
 * the project path points to a file and not a directory will return the
 * filename in the same fashion as if a directory had been read.
 *
 * Will fail and throw for a manner of reasons when doing file/directory
 * inspection.
 *
 * @param {string} projectPath - The path to a projects root directory or a
 * specific project file
 *
 * @return {string[]} List of filenames associated with a projects root
 * directory or the name of the specific project file if that was provided to
 * the 'projectPath' parameter
 *
 * @throws {Error} If the project path doesn't exist
 * @throws {Error} If the project path information can't be collected
 * @throws {Error} If a non-file or non-directory inspected
 */
module.exports = exports = (analysis, next) => {
  const { projectPath, languageAnalysis } = analysis
  try {
    languageAnalysis.projectRootFilenames = getProjectRootFilenames(projectPath)
  } catch (err) {
    next(err)
    return
  }
  next()
}

const getProjectRootFilenames = projectPath => {
  let projectStats = null
  try {
    projectStats = fs.statSync(projectPath)
  } catch (err) {
    throw new Error(
      i18n.__('languageAnalysisProjectRootFileNameFailure', projectPath) +
        `${err.message}`
    )
  }

  // Return the contents of a directory...
  if (projectStats.isDirectory()) {
    try {
      return fs.readdirSync(projectPath)
    } catch (err) {
      throw new Error(
        i18n.__('languageAnalysisProjectRootFileNameReadError', projectPath) +
          `${err.message}`
      )
    }
  }

  // If we are working with a file return it in a list as we do when we work
  // with a directory...
  if (projectStats.isFile()) {
    return [path.basename(projectPath)]
  }

  // Error out if we are working with something like a socket file or some
  // other craziness...
  throw new Error(
    i18n.__('languageAnalysisProjectRootFileNameMissingError'),
    projectPath
  )
}

//For testing purposes
exports.getProjectRootFilenames = getProjectRootFilenames
