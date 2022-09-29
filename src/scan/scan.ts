import commonApi from '../utils/commonApi.js'
import fileUtils from '../scan/fileUtils'
import i18n from 'i18n'
import oraWrapper from '../utils/oraWrapper'

export const allowedFileTypes = ['.jar', '.war', '.js', '.zip', '.exe']

export const isFileAllowed = (scanOption: string) => {
  let valid = false
  allowedFileTypes.forEach(fileType => {
    if (scanOption.endsWith(fileType)) {
      valid = true
    }
  })
  return valid
}

export const sendScan = async (config: any) => {
  if (!isFileAllowed(config.file)) {
    console.log(i18n.__('scanErrorFileMessage'))
    process.exit(9)
  } else {
    fileUtils.checkFilePermissions(config.file)
    const client = commonApi.getHttpClient(config)

    const startUploadSpinner = oraWrapper.returnOra(i18n.__('uploadingScan'))
    oraWrapper.startSpinner(startUploadSpinner)

    return await client
      .sendArtifact(config)
      .then(res => {
        if (res.statusCode === 201) {
          oraWrapper.succeedSpinner(
            startUploadSpinner,
            i18n.__('uploadingScanSuccessful')
          )
          if (config.verbose) {
            console.log(i18n.__('responseMessage', res.body))
          }
          return res.body.id
        } else {
          if (config.debug) {
            console.log(config)
            oraWrapper.failSpinner(
              startUploadSpinner,
              i18n.__('uploadingScanFail')
            )
            console.log(i18n.__('genericServiceError', res.statusCode))
          }
          if (res.statusCode === 429) {
            console.log(i18n.__('exceededFreeTier'))
            process.exit(1)
          }
          if (res.statusCode === 403) {
            console.log(i18n.__('permissionsError'))
            process.exit(1)
          }
          oraWrapper.stopSpinner(startUploadSpinner)
          console.log('Contrast Scan Finished')
          process.exit(1)
        }
      })
      .catch(err => {
        oraWrapper.stopSpinner(startUploadSpinner)
        console.log(err)
      })
  }
}
