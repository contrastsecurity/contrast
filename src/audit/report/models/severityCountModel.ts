export class SeverityCountModel {
  critical!: number
  high!: number
  medium!: number
  low!: number
  note!: number
  total!: number

  //needed as default to stop NaN when new object constructed
  constructor() {
    this.critical = 0
    this.high = 0
    this.medium = 0
    this.low = 0
    this.note = 0
    this.total = 0
  }

  get getTotal(): number {
    return this.critical + this.high + this.medium + this.low + this.note
  }
}
