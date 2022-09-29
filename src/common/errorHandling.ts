import i18n from 'i18n'

const handleResponseErrors = (res: any, api: string) => {
  if (res.statusCode === 400) {
    api === 'catalogue' ? badRequestError(true) : badRequestError(false)
  } else if (res.statusCode === 401) {
    unauthenticatedError()
  } else if (res.statusCode === 403) {
    forbiddenError()
  } else if (res.statusCode === 407) {
    proxyError()
  } else {
    if (api === 'snapshot' || api === 'catalogue') {
      snapshotFailureError()
    }
    if (api === 'vulnerabilities') {
      vulnerabilitiesFailureError()
    }
    if (api === 'report') {
      reportFailureError()
    }
  }
}

const libraryAnalysisError = () => {
  console.log(i18n.__('libraryAnalysisError'))
}

const snapshotFailureError = () => {
  console.log(i18n.__('snapshotFailureMessage'))
}

const vulnerabilitiesFailureError = () => {
  console.log(i18n.__('vulnerabilitiesFailureMessage'))
}

const reportFailureError = () => {
  console.log(i18n.__('auditReportFailureMessage'))
}

const genericError = () => {
  console.error(i18n.__('genericErrorMessage'))
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
  process.exit(1)
}

const proxyError = () => {
  generalError('proxyErrorHeader', 'proxyErrorMessage')
}

const maxAppError = () => {
  generalError(
    'No applications remaining',
    'You have reached the maximum number of application you can create.'
  )
  process.exit(1)
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

  // i18n split the line if it includes '\n'
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

const findCommandOnError = (unknownOptions: string[]) => {
  const commandKeywords = {
    auth: 'auth',
    audit: 'audit',
    scan: 'scan',
    lambda: 'lambda',
    config: 'config'
  }

  const containsCommandKeyword = unknownOptions.some(
    // @ts-ignore
    command => commandKeywords[command]
  )

  if (containsCommandKeyword) {
    const foundCommands = unknownOptions.filter(
      // @ts-ignore
      command => commandKeywords[command]
    )

    //return the first command found
    return foundCommands[0]
  }
}

export {
  genericError,
  unauthenticatedError,
  badRequestError,
  forbiddenError,
  proxyError,
  failOptionError,
  generalError,
  getErrorMessage,
  handleResponseErrors,
  libraryAnalysisError,
  findCommandOnError,
  snapshotFailureError,
  vulnerabilitiesFailureError,
  reportFailureError,
  maxAppError
}
