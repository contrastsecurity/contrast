type Importance = 'important' | 'essential'

interface ArtifactLocation {
  uri: string
}

interface Region {
  startLine: string
  snippet: Snippet
}

interface Snippet {
  text: string
  rendered: Rendered
}

interface Rendered {
  text: string
}

interface PhysicalLocation {
  artifactLocation: ArtifactLocation
  region: Region
}

interface LogicalLocation {
  fullyQualifiedName: string
  name: string
}

export interface Location {
  physicalLocation: PhysicalLocation
  logicalLocations?: LogicalLocation[]
}

export interface ThreadFlowLocation {
  importance: Importance
  location: Location
}

interface ThreadFlow {
  locations: ThreadFlowLocation[]
}

interface Message {
  text: string
}

export interface CodeFlow {
  message: Message
  threadFlows: ThreadFlow[]
}

export interface ResultContent {
  message?: { text: string }
  id: string
  organizationId: string
  projectId: string
  firstCreatedTime: string
  ruleId: string
  codeFlows: CodeFlow[]
  lastSeenTime: string
  locations: Location[]
  name: string
  description: string
  recommendation: string | null
  risk: string | null
  category: string
  confidence: string
  standards: { [key: string]: string[] }
  cwe: string[]
  owasp: string[]
  reference: string[]
  sink: string
  detailsTrigger: string
  type: RuleType
  source: string
  severity: Severity
  advice: string
  learn: string[]
  issue: string
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'note'

export type RuleType = 'DATA_FLOW' | 'CRYPTO' | 'CONFIG' | 'DEFAULT'
