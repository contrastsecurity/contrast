const fs = require('fs')
const i18n = require('i18n')
const chalk = require('chalk')
const save = require('../commands/audit/saveFile')
const sbom = require('../sbom/generateSbom')
const {
  SBOM_CYCLONE_DX_FILE,
  SBOM_SPDX_FILE
} = require('../constants/constants')

async function auditSave(config) {
  let fileFormat
  switch (config.save) {
    case null:
    case SBOM_CYCLONE_DX_FILE:
      fileFormat = SBOM_CYCLONE_DX_FILE
      break
    case SBOM_SPDX_FILE:
      fileFormat = SBOM_SPDX_FILE
      break
    default:
      break
  }

  if (fileFormat) {
    save.saveFile(
      config,
      fileFormat,
      await sbom.generateSbom(config, fileFormat)
    )
    const filename = `${config.applicationId}-sbom-${fileFormat}.json`
    if (fs.existsSync(filename)) {
      console.log(i18n.__('auditSBOMSaveSuccess') + ` - ${filename}`)
    } else {
      console.log(
        chalk.yellow.bold(
          `\n Unable to save ${filename} Software Bill of Materials (SBOM)`
        )
      )
    }
  } else {
    console.log(i18n.__('auditBadFiletypeSpecifiedForSave'))
  }
}

module.exports = {
  auditSave
}
