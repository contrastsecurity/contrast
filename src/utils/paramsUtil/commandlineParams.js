const getAuth = (parsedCLIOptions = {}) => {
  let params = {}
  params.apiKey = parsedCLIOptions['apiKey']
  params.authorization = parsedCLIOptions['authorization']
  params.host = parsedCLIOptions['host']
  params.organizationId = parsedCLIOptions['organizationId']
  return params
}

module.exports = {
  getAuth: getAuth
}
