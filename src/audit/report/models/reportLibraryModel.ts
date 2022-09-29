export class ReportLibraryModel {
  name: string
  cveArray: ReportCVEModel[]

  constructor(name: string, cveArray: ReportCVEModel[]) {
    this.name = name
    this.cveArray = cveArray
  }
}

export class ReportCVEModel {
  name?: string
  description?: string
  authentication?: string
  references?: []
  severityCode?: string
  cvss3SeverityCode?: string

  constructor(
    name: string,
    description: string,
    severityCode: string,
    cvss3SeverityCode: string
  ) {
    this.name = name
    this.description = description
    this.severityCode = severityCode
    this.cvss3SeverityCode = cvss3SeverityCode
  }
}
