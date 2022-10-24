const fs = require('fs')

const writeResultsToFile = async (responseBody, name = 'results.sarif') => {
  try {
    fs.writeFileSync(name, JSON.stringify(responseBody, null, 2))
    return name
  } catch (err) {
    console.log('Error writing Scan Results to file')
  }
}

module.exports = {
  writeResultsToFile: writeResultsToFile
}
