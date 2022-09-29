const fs = require('fs')
const path = require('path')
const i18n = require('i18n')

const getDirectoryFromPathGiven = file => {
  let projectStats = getProjectStats(file)

  if (projectStats.isFile()) {
    let newPath = path.resolve(file)
    return path.dirname(newPath)
  }

  if (projectStats.isDirectory()) {
    return file
  }
}

const getProjectStats = file => {
  try {
    //might not need this
    if (file.endsWith('/')) {
      file = file.slice(0, -1)
    }
    return fs.statSync(file)
  } catch (err) {
    throw new Error(
      i18n.__('languageAnalysisProjectRootFileNameFailure', file) +
        `${err.message}`
    )
  }
}

module.exports = {
  getProjectStats,
  getDirectoryFromPathGiven: getDirectoryFromPathGiven
}
