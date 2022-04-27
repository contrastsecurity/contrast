import i18n from 'i18n'
import * as errorHandling from '../common/errorHandling'

type ErrorDetails = {
  statusCode?: number // API statusCode
  errorCode?: string // internal errorCode
  description?: string // free usage
  data?: any //
}

class CliError extends Error {
  statusCode?: number
  errorCode?: string
  description?: string
  data?: any

  statusCodeDescription?: string
  errorCodeDescription?: string

  constructor(headerMessage: string, details?: ErrorDetails) {
    const message = i18n.__(headerMessage || '')
    super(message)

    const { statusCode, errorCode, data, description } = details || {}

    this.statusCode = statusCode
    this.errorCode = errorCode
    this.data = data
    this.description = description

    if (errorCode) {
      this.errorCodeDescription = i18n.__(errorCode || '')
    }

    if (statusCode) {
      this.statusCodeDescription = this.getMessageByStatusCode(statusCode)
    }
  }

  getErrorMessage() {
    let finalDesc =
      this.errorCodeDescription || this.statusCodeDescription || ''

    if (this.description) {
      finalDesc += finalDesc ? `\n${this.description}` : this.description
    }
    return errorHandling.getErrorMessage(this.message, finalDesc)
  }

  getMessageByStatusCode(statusCode: number) {
    switch (statusCode) {
      case 200:
        return ''
      case 400:
        return i18n.__('badRequestErrorHeader')
      case 401:
        return i18n.__('unauthenticatedErrorHeader')
      case 403:
        return i18n.__('forbiddenRequestErrorHeader')
      case 404:
        return i18n.__('not_found_404')
      case 423:
        return i18n.__('resourceLockedErrorHeader')
      case 500:
        return i18n.__('internalServerErrorHeader')
      default:
        return i18n.__('something_went_wrong')
    }
  }
}

export { CliError }
