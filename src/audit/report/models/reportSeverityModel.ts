export class ReportSeverityModel {
  severity: string
  priority: number
  colour: string
  name: string

  constructor(
    severity: string,
    priority: number,
    colour: string,
    name: string
  ) {
    this.severity = severity
    this.priority = priority
    this.colour = colour
    this.name = name
  }
}
