import type { ColumnType } from "antd/lib/table";

import type { ColumnList, TableHookParam, TColumn, TColumns, TResizeColumn } from "../../ts/typing";
import { TRow, RowData, OneRowData } from '../../../ts/typing'
import { callJSFunction, toS } from "../../../ts/j";
import './styles.css'
import { transformOneColumn } from "../../ts/transcol";
import { getRowKey, isnotdefined, tomoney, visibleColumns } from "../../ts/helper";
import { ExtendedFilter } from "../SearchButton/SearchExtended";
import { constructTableFilter, FFilter } from '../../TableFilter'


// =================================
// create ProColumns from columns
// =================================

export type ColWidth = Map<string, number | string>

export function removeDuplicates(cols: TColumns): TColumns {
  const detected = new Set<string>();
  const outcols: TColumns = []
  cols.forEach(c => {
    if (!detected.has(c.field)) {
      detected.add(c.field)
      outcols.push(c)
    }
  })
  return outcols
}

export function transformColumns(cols: ColumnList, r: TableHookParam, vars?: TRow, colw?: ColWidth, resizeF?: TResizeColumn): ColumnType<any>[] {

  const clist: TColumns = visibleColumns(cols.columns);

  return clist.map((c) => transformOneColumn(c, r, cols, vars, colw?.get(c.field), resizeF));
}

// =============================
// sum elements
// =============================

export function sumnumbers(t: RowData, f: string): string {
  const s: number = t.reduce((a: number, b: TRow) => a + (b[f] ? +(b[f] as string | number) : 0), 0)
  return tomoney(s) as string
}


// ===================================
// filter datasource
// ===================================

function okfilter(p: ColumnList, pars: OneRowData): boolean {
  const res: boolean = callJSFunction(p.filterJS as string, pars);
  return res
}

export function filterDataSource(p: ColumnList, pars: OneRowData): RowData {
  return pars.t?.filter((e: TRow) => okfilter(p, { r: e, t: pars.t, vars: pars.vars })) as RowData
}

// ======================================
// filter according to SearchButton
// ======================================

function okextendedfilter(p: ColumnList, r: TRow, valf: TRow, f: Record<string, FFilter>) {

  // 2023/04/10 - loop through f
  for (let v in f) {
    const ff: FFilter = f[v]
    if (!ff(valf[v] as string | number | boolean, r)) return false;
  }
  return true;
}

function createFilters(p: ColumnList, pars: ExtendedFilter): Record<string, FFilter> {
  const f: Record<string, FFilter> = {}
  const v: TRow = (pars.filtervalues as TRow)
  p.columns.filter(c => (!isnotdefined(v[c.field]))).forEach(c => f[c.field] = constructTableFilter(c))
  return f;
}

export function filterDataSourceButton(p: ColumnList, rows: RowData, pars: ExtendedFilter): RowData {
  if (pars.isfilter) {
    const f: Record<string, FFilter> = createFilters(p, pars)
    const v: TRow = (pars.filtervalues as TRow)
    return rows.filter(e => okextendedfilter(p, e, v, f))
  }
  return rows
}

// ========================
// search
// ========================

export type CurrentPos = {
  pageno: number,
  onpage: number,
  pos: number
}

const initPos: CurrentPos = {
  pageno: 1,
  onpage: 0,
  pos: 0
}

function incPos(curr: CurrentPos, pagesize: number | undefined, rows: RowData): CurrentPos | undefined {
  const nextPos: CurrentPos =
    ((pagesize !== undefined) && curr.onpage + 1 === pagesize) ?
      {
        pageno: curr.pageno + 1,
        onpage: 0,
        pos: curr.pos + 1
      }
      :
      {
        pageno: curr.pageno,
        onpage: curr.onpage + 1,
        pos: curr.pos + 1
      }
  return (nextPos.pos >= rows.length) ? undefined : nextPos

}

function findcurrentRow(current: CurrentPos, rows: RowData, pagesize: number | undefined, okF: (r: TRow) => boolean): CurrentPos | undefined {
  let curPos: CurrentPos | undefined = current
  while (curPos !== undefined && !okF(rows[curPos.pos])) {
    curPos = incPos(curPos, pagesize, rows)
  }
  return curPos
}

export function eqRow(p: ColumnList, r1: TRow, r2: TRow): boolean {
  const rowkey: string = getRowKey(p)
  const currentRowValue = toS(r1[rowkey])
  const rowVal = toS(r2[rowkey])
  return rowVal === currentRowValue
}

export function searchDataSource(p: ColumnList, currentRow: TRow | undefined, rows: RowData, pars: ExtendedFilter, pagesize: number | undefined): CurrentPos | undefined {
  if (rows.length == 0) return undefined
  let currentPos: CurrentPos | undefined = initPos
  if (currentRow !== undefined) {
    currentPos = findcurrentRow(currentPos, rows, pagesize, (r: TRow) => eqRow(p, r, currentRow))
    if (currentPos === undefined) return undefined
    currentPos = incPos(currentPos, pagesize, rows)
  }
  if (currentPos === undefined) return undefined

  const f: Record<string, FFilter> = createFilters(p, pars)

  const okFilter = (r: TRow) => {
    return okextendedfilter(p, r, pars.filtervalues, f)
  }
  return findcurrentRow(currentPos, rows, pagesize, okFilter)
}
