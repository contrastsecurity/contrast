const HttpClient = require('./../common/HTTPClient')
const {
  badRequestError,
  unauthenticatedError,
  forbiddenError,
  proxyError,
  genericError,
  maxAppError
} = require('../common/errorHandling')

const handleResponseErrors = (res, api) => {
  if (res.statusCode === 400) {
    api === 'catalogue' ? badRequestError(true) : badRequestError(false)
  } else if (res.statusCode === 401) {
    unauthenticatedError()
  } else if (res.statusCode === 403) {
    forbiddenError()
  } else if (res.statusCode === 407) {
    proxyError()
  } else if (res.statusCode === 412) {
    maxAppError()
  } else {
    genericError(res)
  }
}

const getProtocol = host => {
  const hasProtocol =
    host.toLowerCase().includes('https://') ||
    host.toLowerCase().includes('http://')
  return hasProtocol ? host : 'https://' + host
}

const getPath = host => {
  const hasContrastPath = host.toLowerCase().endsWith('/contrast')
  return hasContrastPath
    ? host.toLowerCase().substring(0, host.length - 9)
    : host.replace(/\/*$/, '')
}

const getValidHost = host => {
  const correctProtocol = getProtocol(host)
  return getPath(correctProtocol)
}

const getHttpClient = config => {
  return new HttpClient(config)
}

module.exports = {
  getPath: getPath,
  getValidHost: getValidHost,
  getProtocol: getProtocol,
  handleResponseErrors: handleResponseErrors,
  getHttpClient: getHttpClient
}
