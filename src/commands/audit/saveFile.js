const fs = require('fs')

const saveFile = (config, type, rawResults) => {
  const fileName = `${config.applicationId}-sbom-${type}.json`
  fs.writeFileSync(fileName, JSON.stringify(rawResults))
}

module.exports = {
  saveFile
}
