export class ReportOutputModel {
  header: ReportOutputHeaderModel
  body: ReportOutputBodyModel

  constructor(header: ReportOutputHeaderModel, body: ReportOutputBodyModel) {
    this.header = header
    this.body = body
  }
}

export class ReportOutputHeaderModel {
  vulnMessage: string
  introducesMessage: string

  constructor(vulnMessage: string, introducesMessage: string) {
    this.vulnMessage = vulnMessage
    this.introducesMessage = introducesMessage
  }
}

export class ReportOutputBodyModel {
  issueMessage: string[]
  adviceMessage: string[]

  constructor(issueMessage: string[], adviceMessage: string[]) {
    this.issueMessage = issueMessage
    this.adviceMessage = adviceMessage
  }
}
