import { ReportSeverityModel } from './reportSeverityModel'
import { ReportCVEModel } from './reportLibraryModel'

export class ReportList {
  reportOutputList: ReportModelStructure[]

  constructor() {
    this.reportOutputList = []
  }
}

export class ReportModelStructure {
  compositeKey: ReportCompositeKey
  cveArray: ReportCVEModel[]

  constructor(compositeKey: ReportCompositeKey, cveArray: ReportCVEModel[]) {
    this.compositeKey = compositeKey
    this.cveArray = cveArray
  }
}

export class ReportCompositeKey {
  libraryName!: string
  libraryVersion!: string
  highestSeverity!: ReportSeverityModel
  numberOfSeverities!: number

  constructor(
    libraryName: string,
    libraryVersion: string,
    highestSeverity: ReportSeverityModel,
    numberOfSeverities: number
  ) {
    this.libraryName = libraryName
    this.libraryVersion = libraryVersion
    this.highestSeverity = highestSeverity
    this.numberOfSeverities = numberOfSeverities
  }
}
