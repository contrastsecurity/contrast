const getAuth = () => {
  let params = {}
  params.apiKey = process.env.CONTRAST__API__API_KEY
  params.authorization = process.env.CONTRAST__API__AUTHORIZATION
  params.host = process.env.CONTRAST__API__URL
  params.organizationId = process.env.CONTRAST__API__ORGANIZATION_ID
  return params
}

module.exports = { getAuth: getAuth }
