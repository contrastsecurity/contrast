const fs = require('fs')

const writeResultsToFile = async (responseBody, name = 'results.sarif') => {
  try {
    fs.writeFileSync(name, JSON.stringify(responseBody, null, 2))
    console.log(`Scan Results saved to ${name}`)
  } catch (err) {
    console.log('Error writing Scan Results to file')
  }
}

module.exports = {
  writeResultsToFile: writeResultsToFile
}
