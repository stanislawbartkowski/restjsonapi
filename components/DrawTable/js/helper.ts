import type { ColumnType } from "antd/lib/table";

import type { ColumnList, TableHookParam, TColumn, TColumns } from "../../ts/typing";
import { TRow, RowData, OneRowData } from '../../../ts/typing'
import { callJSFunction } from "../../../ts/j";
import './styles.css'
import { transformOneColumn } from "../../ts/transcol";
import { tomoney, findColDetails } from "../../ts/helper";
import { ExtendedFilter } from "../SearchButton/SearchExtended";
import { constructTableFilter, FFilter } from '../../TableFilter'


// =================================
// create ProColumns from columns
// =================================

function includeColumn(col: TColumn): boolean {
  return col.tablenodef === undefined || !col.tablenodef
}

export function visibleColumns(cols: TColumns): TColumns {
  return cols.filter(e => includeColumn(e))
}

export function transformColumns(cols: ColumnList, r: TableHookParam, vars?: TRow): ColumnType<any>[] {

  const clist: TColumns = visibleColumns(cols.columns);

  return clist.map((c) => transformOneColumn(c, r, cols, vars));
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

  for (let v in valf) {
    const ff: FFilter = f[v]
//    console.log(v)
//    console.log(ff)
    if (!ff(valf[v] as string | number | boolean, r)) return false;
  }
  return true;
}

export function filterDataSourceButton(p: ColumnList, rows: RowData, pars: ExtendedFilter): RowData {
  if (pars.isfilter) {
    const f: Record<string, FFilter> = {}
    const v: TRow = (pars.filtervalues as TRow)
    p.columns.filter(c => v[c.field] !== undefined).forEach(c => f[c.field] = constructTableFilter(c))
    return rows.filter(e => okextendedfilter(p, e, v, f))
  }
  return rows
}

