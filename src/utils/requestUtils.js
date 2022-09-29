const request = require('request')
const Promise = require('bluebird')

Promise.promisifyAll(request)

function sendRequest({ options, method = 'put' }) {
  return request[`${method}Async`](options.url, options)
}

const millisToSeconds = millis => {
  return (millis / 1000).toFixed(0)
}

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const timeOutError = (ms, reject) => {
  return setTimeout(() => {
    reject(new Error(`No input detected after 30s`))
  }, ms)
}

module.exports = {
  sendRequest: sendRequest,
  sleep: sleep,
  millisToSeconds: millisToSeconds,
  timeOutError: timeOutError
}
