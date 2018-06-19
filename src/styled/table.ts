// tslint:disable

import * as _ from 'lodash'

import deps from '../deps'

export interface TableColumn {
  key: string
  label?: string | (() => string)
  format(value: string, row: string): string
  get(row: any[]): string
  width: number
}

export interface TableOptions {
  columns: Partial<TableColumn>[]
  colSep: string
  after(row: any[], options: TableOptions): void
  printLine(row: any[]): void
  printRow(row: any[]): void
  printHeader(row: any[]): void
  headerAnsi: any
}

/**
 * Generates a Unicode table and feeds it into configured printer.
 *
 * Top-level arguments:
 *
 * @arg {Object[]} data - the records to format as a table.
 * @arg {Object} options - configuration for the table.
 *
 * @arg {Object[]} [options.columns] - Options for formatting and finding values for table columns.
 * @arg {function(string)} [options.headerAnsi] - Zero-width formattter for entire header.
 * @arg {string} [options.colSep] - Separator between columns.
 * @arg {function(row, options)} [options.after] - Function called after each row is printed.
 * @arg {function(string)} [options.printLine] - Function responsible for printing to terminal.
 * @arg {function(cells)} [options.printHeader] - Function to print header cells as a row.
 * @arg {function(cells)} [options.printRow] - Function to print cells as a row.
 *
 * @arg {function(row)|string} [options.columns[].key] - Path to the value in the row or function to retrieve the pre-formatted value for the cell.
 * @arg {function(string)} [options.columns[].label] - Header name for column.
 * @arg {function(string, row)} [options.columns[].format] - Formatter function for column value.
 * @arg {function(row)} [options.columns[].get] - Function to return a value to be presented in cell without formatting.
 *
 */
export default function table(data: any[], inputOptions: Partial<TableOptions> = {}) {
  const options: TableOptions = {
    colSep: '  ',
    after: () => {},
    headerAnsi: _.identity,
    printLine: (s: any) => console.log(s),
    printRow(cells: any[]) {
      this.printLine((cells.join(this.colSep) as any).trimRight())
    },
    printHeader(cells: any[]) {
      this.printRow(cells.map(_.ary(this.headerAnsi, 1)))
      this.printRow(cells.map(hdr => hdr.replace(/./g, '─')))
    },
    ...inputOptions,
    columns: (inputOptions.columns || []).map(c => ({
      format: (value: any) => (value != null ? value.toString() : ''),
      width: 0,
      label() {
        return this.key!.toString()
      },

      get(row: any) {
        let value
        let path: any = _.result(this, 'key')

        if (!path) {
          value = row
        } else {
          value = _.get(row, path)
        }

        return (this.format as any)(value, row)
      },
      ...c,
    })),
  }

  function calcWidth(cell: any) {
    let lines = deps.stripAnsi(cell).split(/[\r\n]+/)
    let lineLengths = lines.map(_.property('length'))
    return Math.max.apply(Math, lineLengths)
  }

  function pad(string: string, length: number) {
    let visibleLength = deps.stripAnsi(string).length
    let diff = length - visibleLength

    return string + ' '.repeat(Math.max(0, diff))
  }

  function render() {
    let columns: TableColumn[] = options.columns as any

    if (typeof columns[0] === 'string') {
      columns = (columns as any).map((key: any) => ({key}))
    }

    for (let row of data) {
      row.height = 1
      for (let col of columns) {
        let cell = col.get(row)

        col.width = Math.max((_.result(col, 'label') as string).length, col.width || 0, calcWidth(cell))

        row.height = Math.max(row.height || 0, cell.split(/[\r\n]+/).length)
      }
    }

    if (options.printHeader) {
      options.printHeader(
        columns.map(function (col) {
          let label = _.result(col, 'label') as string
          return pad(label, col.width || label.length)
        }),
      )
    }

    function getNthLineOfCell(n: any, row: any, col: any) {
      // TODO memoize this
      let lines = col.get(row).split(/[\r\n]+/)
      return pad(lines[n] || '', col.width)
    }

    for (let row of data) {
      for (let i = 0; i < (row.height || 0); i++) {
        let cells = columns.map(_.partial(getNthLineOfCell, i, row))
        options.printRow(cells)
      }
      options.after(row, options)
    }
  }

  render()
}
