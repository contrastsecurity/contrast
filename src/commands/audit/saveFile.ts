import fs from 'fs'

export default function saveFile(config: any, rawResults: any) {
  const fileName = `${config.applicationId}-sbom-cyclonedx.json`
  fs.writeFileSync(fileName, JSON.stringify(rawResults))
}
