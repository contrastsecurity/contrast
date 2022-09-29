import fs from 'fs'

export const saveFile = (config: any, type: string, rawResults: any) => {
  const fileName = `${config.applicationId}-sbom-${type}.json`
  fs.writeFileSync(fileName, JSON.stringify(rawResults))
}

module.exports = {
  saveFile
}
