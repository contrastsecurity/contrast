const request = require('request')
const Promise = require('bluebird')

Promise.promisifyAll(request)

function sendRequest({ options, method = 'put' }) {
  return request[`${method}Async`](options.url, options)
}

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  sendRequest: sendRequest,
  sleep: sleep
}
