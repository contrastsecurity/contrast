import { ResultContent } from './resultContentModel'

export class ScanResultsModel {
  projectOverview: ProjectOverview
  scanDetail: ScanDetail
  scanResultsInstances: ScanResultsInstances
  newProject: boolean

  constructor(scan: any) {
    this.projectOverview = scan.projectOverview as ProjectOverview
    this.scanDetail = scan.scanDetail as ScanDetail
    this.scanResultsInstances =
      scan.scanResultsInstances as ScanResultsInstances
    this.newProject = scan.newProject
  }
}

export interface ProjectOverview {
  id: string
  organizationId: string
  name: string
  archived: boolean
  language: string
  critical: number
  high: number
  medium: number
  low: number
  note: number
  lastScanTime: string
  completedScans: number
  lastScanId: string
}

export interface ScanDetail {
  critical: number
  high: number
  medium: number
  low: number
  note: number
  id: string
  organizationId: string
  projectId: string
  codeArtifactId: string
  status: string
  createdTime: string
  startedTime: string
  completedTime: string
  language: string
  label: string
  errorMessage: string
}

export interface ScanResultsInstances {
  content: ResultContent[]
}
