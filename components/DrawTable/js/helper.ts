import type { ColumnType } from "antd/lib/table";

import type { ColumnList, TableHookParam, TColumn, TColumns } from "../../ts/typing";
import { TRow, RowData, OneRowData } from '../../../ts/typing'
import { callJSFunction, isString } from "../../../ts/j";
import defaults from '../../../ts/defaults'
import './styles.css'
import { transformOneColumn } from "../../ts/transcol";

// =================================
// create ProColumns from columns
// =================================

function includeColumn(col: TColumn): boolean {
  return col.tablenodef === undefined || !col.tablenodef
}

export function visibleColumns(cols: TColumns) : TColumns {
  return cols.filter(e => includeColumn(e))
}

export function transformColumns(cols: ColumnList, r: TableHookParam, vars?: TRow): ColumnType<any>[] {

  const clist : TColumns = visibleColumns(cols.columns);

  return clist.map((c) => transformOneColumn(c, r, cols, vars));
}

// =============================
// sum elements
// =============================

export function sumnumbers(t: RowData, f: string): string {
  const s: number = t.reduce((a: number, b: TRow) => a + (b[f] ? +(b[f] as string | number) : 0), 0)
  return tomoney(s) as string
}

export function tomoney(t: string | number | undefined): undefined | string {
  if (t === undefined || t == null) return undefined
  if (isString(t)) return (+t).toFixed(defaults.moneydot)
  return (t as number).toFixed(defaults.moneydot)
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