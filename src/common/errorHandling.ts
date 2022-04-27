import i18n from 'i18n'

const genericError = (missingCliOption: string) => {
  // prettier-ignore
  console.log(`*************************** ${i18n.__('yamlMissingParametersHeader')} ***************************\n${missingCliOption}`)
  console.error(i18n.__('yamlMissingParametersMessage'))
  process.exit(1)
}

const unauthenticatedError = () => {
  generalError('unauthenticatedErrorHeader', 'unauthenticatedErrorMessage')
}

const badRequestError = (catalogue: boolean) => {
  catalogue === true
    ? generalError('badRequestErrorHeader', 'badRequestCatalogueErrorMessage')
    : generalError('badRequestErrorHeader', 'badRequestErrorMessage')
}

const forbiddenError = () => {
  generalError('forbiddenRequestErrorHeader', 'forbiddenRequestErrorMessage')
}

const proxyError = () => {
  generalError('proxyErrorHeader', 'proxyErrorMessage')
}

const hostWarningError = () => {
  console.log(i18n.__('snapshotHostMessage'))
}

const failOptionError = () => {
  console.log(
    '\n ******************************** ' +
      i18n.__('snapshotFailureHeader') +
      ' ********************************\n' +
      i18n.__('failOptionErrorMessage')
  )
}

/**
 * You don't have to pass `i18n` translation.
 * String that didn't exists on translations will pass as regular string
 * @param header title for the error
 * @param message message for the error
 * @returns error in general format
 */
const getErrorMessage = (header: string, message?: string) => {
  // prettier-ignore
  const title = `******************************** ${i18n.__(header)} ********************************`
  const multiLine = message?.includes('\n')
  let finalMessage = ''

  // i18n split the line if it includes "\n"
  if (multiLine) {
    finalMessage = `\n${message}`
  } else if (message) {
    finalMessage = `\n${i18n.__(message)}`
  }

  return `${title}${finalMessage}`
}

const generalError = (header: string, message?: string) => {
  const finalMessage = getErrorMessage(header, message)
  console.log(finalMessage)
}

export {
  genericError,
  unauthenticatedError,
  badRequestError,
  forbiddenError,
  proxyError,
  failOptionError,
  hostWarningError,
  generalError,
  getErrorMessage
}
