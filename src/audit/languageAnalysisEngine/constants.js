// Language identifiers
const NODE = 'NODE'
const JAVASCRIPT = 'JAVASCRIPT'
const DOTNET = 'DOTNET'
const JAVA = 'JAVA'
const RUBY = 'RUBY'
const PYTHON = 'PYTHON'
const GO = 'GO'
// we set the langauge as Node instead of PHP since we're using the Node engine in TS
const PHP = 'PHP'

const LOW = 'LOW'
const MEDIUM = 'MEDIUM'
const HIGH = 'HIGH'
const CRITICAL = 'CRITICAL'

module.exports = {
  supportedLanguages: { NODE, DOTNET, JAVA, RUBY, PYTHON, GO, PHP, JAVASCRIPT },
  LOW: LOW,
  MEDIUM: MEDIUM,
  HIGH: HIGH,
  CRITICAL: CRITICAL
}
