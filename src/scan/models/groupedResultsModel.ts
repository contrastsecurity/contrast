export class GroupedResultsModel {
  ruleId: string
  codePathSet: Set<string>
  cwe?: string[]
  reference?: string[]
  severity?: string
  advice?: string
  learn?: string[]
  issue?: string
  priority?: number
  message?: string | undefined
  colour: string
  codePath?: string

  constructor(ruleId: string) {
    this.ruleId = ruleId
    this.colour = '#999999'
    this.codePathSet = new Set<string>()
  }
}
