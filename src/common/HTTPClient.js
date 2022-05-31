const _ = require('lodash')
const fs = require('fs')
const requestUtils = require('./../utils/requestUtils')
const { AUTH_CALLBACK_URL } = require('../constants/constants')

function HTTPClient(config) {
  const apiKey = config.apiKey
  const authToken = config.authorization
  this.rejectUnauthorized = !config.ignoreCertErrors

  const superApiKey = config.superApiKey
  const superAuthToken = config.superAuthorization

  this.requestOptions = {
    forever: true,
    json: true,
    rejectUnauthorized: this.rejectUnauthorized,
    uri: config.host,
    followRedirect: false,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: authToken,
      'API-Key': apiKey,
      SuperAuthorization: superAuthToken,
      'Super-API-Key': superApiKey
    }
  }

  if (config.proxy) {
    this.requestOptions.proxy = config.proxy
  }

  this.maybeAddCertsToRequest(config)
}

HTTPClient.prototype.maybeAddCertsToRequest = function(config) {
  // cacert
  const caCertFilePath = config.cacert
  if (caCertFilePath) {
    const caFileContent = fs.readFileSync(caCertFilePath)
    if (caFileContent instanceof Error) {
      throw new Error(
        `Unable to read CA from config option contrast.api.certificate.ca_file='${caCertFilePath}', msg: ${caFileContent.message}`
      )
    }
    this.requestOptions.ca = caFileContent
  }

  // cert
  const certPath = config.cert
  if (certPath) {
    const certFile = fs.readFileSync(certPath)
    if (certFile instanceof Error) {
      throw new Error(
        `Unable to read Certificate PEM file from config option contrast.api.certificate.cert_file='${certPath}', msg: ${certFile.message}`
      )
    }
    this.requestOptions.cert = certFile
  }

  // key
  const keyPath = config.key
  if (keyPath) {
    const keyFile = fs.readFileSync(keyPath)
    if (keyFile instanceof Error) {
      throw new Error(
        `Unable to read Key PEM file from config option contrast.api.certificate.key_file='${keyPath}', msg: ${keyFile.message}`
      )
    }
    this.requestOptions.key = keyFile
  }
}

HTTPClient.prototype.getScanResultsInstances = function getScanResultsInstances(
  config,
  scanId
) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createScanResultsInstancesURL(config, scanId)
  options.url = url
  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.getSpecificScanResult = function getSpecificScanResult(
  config,
  scanId
) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createSpecificScanResultURL(config, scanId)
  options.url = url
  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.getSpecificScanResultSarif = function getSpecificScanResultSarif(
  config,
  scanId
) {
  const options = _.cloneDeep(this.requestOptions)
  options.url = createRawOutputURL(config, scanId)
  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.getScanId = function getScanId(config, codeArtifactId) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createGetScanIdURL(config)
  options.url = url
  options.body = {
    codeArtifactId: codeArtifactId,
    label: `Started by CLI tool at ${new Date().toString()}`
  }
  return requestUtils.sendRequest({ method: 'post', options })
}

HTTPClient.prototype.sendArtifact = async function sendArtifact(config) {
  const options = _.cloneDeep(this.requestOptions)

  let formData = {
    filename: fs.createReadStream(config.file)
  }
  options.formData = formData
  options.headers['Content-Type'] = 'multipart/form-data'
  options.url = createHarmonyUrl(config)
  return requestUtils.sendRequest({ method: 'post', options })
}

HTTPClient.prototype.createProjectId = function createProjectId(config) {
  const options = _.cloneDeep(this.requestOptions)

  options.body = {
    name: config.name,
    archived: 'false'
  }
  if (config.language) {
    options.body.language = config.language
  }
  options.url = createHarmonyProjectsUrl(config)
  return requestUtils.sendRequest({ method: 'post', options })
}

HTTPClient.prototype.getProjectIdByName = function getProjectIdByName(config) {
  const options = _.cloneDeep(this.requestOptions)

  options.url = createHarmonyProjectsUrl(config) + '?name=' + config.name
  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.getScanProjectById = function getScanProjectById(config) {
  const options = _.cloneDeep(this.requestOptions)

  options.url = createScanProjectUrl(config)
  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.getGlobalProperties = function getGlobalProperties() {
  const options = _.cloneDeep(this.requestOptions)
  let url = createGlobalPropertiesUrl(options.uri)
  options.url = url
  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.pollForAuth = function pollForAuth(token) {
  const options = _.cloneDeep(this.requestOptions)
  let url = pollForAuthUrl()
  options.url = url

  let requestBody = {}
  requestBody.token = token
  options.body = requestBody

  return requestUtils.sendRequest({ method: 'post', options })
}

HTTPClient.prototype.catalogueCommand = function catalogueCommand(config) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createAppCreateURL(config)
  options.url = url

  let requestBody = {}
  requestBody.name = config.applicationName
  requestBody.language = config.language.toUpperCase()
  requestBody.appGroups = config.appGroups
  requestBody.metadata = config.metadata
  requestBody.tags = config.tags
  requestBody.code = config.code
  options.body = requestBody

  return requestUtils.sendRequest({ method: 'post', options })
}

HTTPClient.prototype.sendSnapshot = function sendSnapshot(requestBody, config) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createSnapshotURL(config)
  options.url = url
  options.body = requestBody
  return requestUtils.sendRequest({ method: 'post', options })
}

HTTPClient.prototype.getReport = function getReport(config) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createReportUrl(config)
  options.url = url

  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.getSpecificReport = function getSpecificReport(
  config,
  reportId
) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createSpecificReportUrl(config, reportId)
  options.url = url

  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.getLibraryVulnerabilities = function getLibraryVulnerabilities(
  requestBody,
  config
) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createLibraryVulnerabilitiesUrl(config)
  options.url = url
  options.body = requestBody

  return requestUtils.sendRequest({ method: 'put', options })
}

HTTPClient.prototype.getAppId = function getAppId(config) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createAppNameUrl(config)
  options.url = url
  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.getDependencyTree = function getReport(
  orgUuid,
  appId,
  reportId
) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createGetDependencyTree(options.uri, orgUuid, appId, reportId)
  options.url = url
  return requestUtils.sendRequest({ method: 'get', options })
}

// serverless - lambda
function getServerlessHost(config = {}) {
  const originalHost = config?.host || config?.get('host')
  const host = originalHost?.endsWith('/')
    ? originalHost.slice(0, -1)
    : originalHost

  return `${host}/Contrast/api/serverless`
}

function createScanFunctionPostUrl(config, params) {
  const url = getServerlessHost(config)
  const { provider, accountId, organizationId } = params

  return `${url}/organizations/${organizationId}/providers/${provider}/accounts/${accountId}/function-scan`
}

function createScanResourcesGetUrl(config, params, scanId) {
  const url = getServerlessHost(config)
  const { provider, accountId, organizationId } = params
  const encodedScanId = encodeURIComponent(scanId)

  return `${url}/organizations/${organizationId}/providers/${provider}/accounts/${accountId}/scans/${encodedScanId}/resources`
}

function createScanResultsGetUrl(config, params, scanId, functionArn) {
  const url = getServerlessHost(config)
  const encodedScanId = encodeURIComponent(scanId)
  const encodedFunctionArn = encodeURIComponent(functionArn)
  const { provider, accountId, organizationId } = params

  return `${url}/organizations/${organizationId}/providers/${provider}/accounts/${accountId}/scans/${encodedScanId}/resources/${encodedFunctionArn}/results`
}

HTTPClient.prototype.postFunctionScan = async function postFunctionScan(
  config,
  params,
  body
) {
  const url = createScanFunctionPostUrl(config, params)
  const options = { ...this.requestOptions, body, url }

  return requestUtils.sendRequest({ method: 'post', options })
}

HTTPClient.prototype.getScanResources = async function getScanResources(
  config,
  params,
  scanId
) {
  const url = createScanResourcesGetUrl(config, params, scanId)
  const options = { ...this.requestOptions, url }

  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.getFunctionScanResults = async function getFunctionScanResults(
  config,
  params,
  scanId,
  functionArn
) {
  const url = createScanResultsGetUrl(config, params, scanId, functionArn)
  const options = { ...this.requestOptions, url }

  return requestUtils.sendRequest({ method: 'get', options })
}

HTTPClient.prototype.checkLibrary = function checkLibrary(data) {
  const options = _.cloneDeep(this.requestOptions)
  let url = createDataUrl()
  options.url = url
  options.body = data
  return requestUtils.sendRequest({ method: 'post', options })
}

HTTPClient.prototype.getSbom = function getSbom(config) {
  const options = _.cloneDeep(this.requestOptions)
  options.url = createSbomCycloneDXUrl(config)
  return requestUtils.sendRequest({ method: 'get', options })
}

// scan
const createGetScanIdURL = config => {
  return `${config.host}/Contrast/api/sast/v1/organizations/${config.organizationId}/projects/${config.projectId}/scans/`
}

const createScanResultsInstancesURL = (config, scanId) => {
  return `${config.host}/Contrast/api/sast/v1/organizations/${config.organizationId}/projects/${config.projectId}/scans/${scanId}/result-instances/info?size=50&page=0&last=false&sort=severity,asc`
}

const createRawOutputURL = (config, scanId) => {
  return `${config.host}/Contrast/api/sast/v1/organizations/${config.organizationId}/projects/${config.projectId}/scans/${scanId}/raw-output`
}

const createSpecificScanResultURL = (config, scanId) => {
  return `${config.host}/Contrast/api/sast/v1/organizations/${config.organizationId}/projects/${config.projectId}/scans/${scanId}`
}

function createHarmonyUrl(config) {
  return `${config.host}/Contrast/api/sast/v1/organizations/${config.organizationId}/projects/${config.projectId}/code-artifacts`
}

function createHarmonyProjectsUrl(config) {
  return `${config.host}/Contrast/api/sast/v1/organizations/${config.organizationId}/projects`
}

function createScanProjectUrl(config) {
  return `${config.host}/Contrast/api/sast/v1/organizations/${config.organizationId}/projects/${config.projectId}`
}

const createGlobalPropertiesUrl = protocol => {
  return `${protocol}/Contrast/api/ng/global/properties`
}

const pollForAuthUrl = () => {
  return `${AUTH_CALLBACK_URL}/auth/credentials`
}

function createSnapshotURL(config) {
  return `${config.host}/Contrast/api/ng/sca/organizations/${config.organizationId}/applications/${config.applicationId}/snapshots`
}

const createAppCreateURL = config => {
  return `${config.host}/Contrast/api/ng/sca/organizations/${config.organizationId}/applications/create`
}

const createAppNameUrl = config => {
  return `${config.host}/Contrast/api/ng/${config.organizationId}/applications/name?filterText=${config.applicationName}`
}

function createLibraryVulnerabilitiesUrl(config) {
  return `${config.host}/Contrast/api/ng/${config.organizationId}/libraries/artifactsByGroupNameVersion`
}

function createReportUrl(config) {
  return `${config.host}/Contrast/api/ng/sca/organizations/${config.organizationId}/applications/${config.applicationId}/reports`
}

function createSpecificReportUrl(config, reportId) {
  return `${config.host}/Contrast/api/ng/sca/organizations/${config.organizationId}/applications/${config.applicationId}/reports/${reportId}?nodesToInclude=PROD`
}

function createDataUrl() {
  return `https://ardy.contrastsecurity.com/production`
}

const createGetDependencyTree = (protocol, orgUuid, appId, reportId) => {
  return `${protocol}/Contrast/api/ng/sca/organizations/${orgUuid}/applications/${appId}/reports/${reportId}`
}

function createSbomCycloneDXUrl(config) {
  return `${config.host}/Contrast/api/ng/${config.organizationId}/applications/${config.applicationId}/libraries/sbom/cyclonedx`
}

module.exports = HTTPClient
module.exports.pollForAuthUrl = pollForAuthUrl
module.exports.getServerlessHost = getServerlessHost
