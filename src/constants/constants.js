// Language identifiers
const NODE = 'NODE'
const DOTNET = 'DOTNET'
const JAVA = 'JAVA'
const RUBY = 'RUBY'
const PYTHON = 'PYTHON'
const GO = 'GO'
const PHP = 'PHP'
const JAVASCRIPT = 'JAVASCRIPT'
// Severity
const LOW = 'LOW'
const MEDIUM = 'MEDIUM'
const HIGH = 'HIGH'
const CRITICAL = 'CRITICAL'
// App
const APP_NAME = 'contrast'
const APP_VERSION = '1.0.13'
const TIMEOUT = 120000
const HIGH_COLOUR = '#ff9900'
const CRITICAL_COLOUR = '#e35858'
const MEDIUM_COLOUR = '#f1c232'
const LOW_COLOUR = '#b7b7b7'
const NOTE_COLOUR = '#999999'
const CRITICAL_PRIORITY = 1
const HIGH_PRIORITY = 2
const MEDIUM_PRIORITY = 3
const LOW_PRIORITY = 4
const NOTE_PRIORITY = 5

const AUTH_UI_URL = 'https://cli-auth.contrastsecurity.com'
const AUTH_CALLBACK_URL = 'https://cli-auth-api.contrastsecurity.com'
const SARIF_FILE = 'SARIF'
const SBOM_CYCLONE_DX_FILE = 'cyclonedx'
const SBOM_SPDX_FILE = 'spdx'
const CE_URL = 'https://ce.contrastsecurity.com'

module.exports = {
  supportedLanguages: { NODE, DOTNET, JAVA, RUBY, PYTHON, GO, PHP, JAVASCRIPT },
  supportedLanguagesScan: { JAVASCRIPT, DOTNET, JAVA },
  LOW,
  MEDIUM,
  HIGH,
  CRITICAL,
  APP_VERSION,
  APP_NAME,
  TIMEOUT,
  AUTH_UI_URL,
  AUTH_CALLBACK_URL,
  SARIF_FILE,
  HIGH_COLOUR,
  CRITICAL_COLOUR,
  MEDIUM_COLOUR,
  LOW_COLOUR,
  NOTE_COLOUR,
  CE_URL,
  CRITICAL_PRIORITY,
  HIGH_PRIORITY,
  MEDIUM_PRIORITY,
  LOW_PRIORITY,
  NOTE_PRIORITY,
  SBOM_CYCLONE_DX_FILE,
  SBOM_SPDX_FILE
}
