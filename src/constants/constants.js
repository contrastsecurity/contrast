// Language identifiers
const NODE = 'NODE'
const DOTNET = 'DOTNET'
const JAVA = 'JAVA'
const RUBY = 'RUBY'
const PYTHON = 'PYTHON'
const GO = 'GO'
// we set the langauge as Node instead of PHP since we're using the Node engine in TS
const PHP = 'PHP'
const JAVASCRIPT = 'JAVASCRIPT'
const LOW = 'LOW'
const MEDIUM = 'MEDIUM'
const HIGH = 'HIGH'
const CRITICAL = 'CRITICAL'
const APP_NAME = 'contrast'
const APP_VERSION = '1.0.3'
const TIMEOUT = 120000

const AUTH_UI_URL = 'https://cli-auth.contrastsecurity.com'
const AUTH_CALLBACK_URL = 'https://cli-auth-api.contrastsecurity.com'
const SARIF_FILE = 'SARIF'

module.exports = {
  supportedLanguages: { NODE, DOTNET, JAVA, RUBY, PYTHON, GO, PHP, JAVASCRIPT },
  LOW,
  MEDIUM,
  HIGH,
  CRITICAL,
  APP_VERSION,
  APP_NAME,
  TIMEOUT,
  AUTH_UI_URL,
  AUTH_CALLBACK_URL,
  SARIF_FILE
}
