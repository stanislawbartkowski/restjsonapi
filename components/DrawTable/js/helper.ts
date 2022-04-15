import React from "react";
import type { ColumnType } from "antd/lib/table";

import type { ColumnValue, ColumnList, TableHookParam, TColumn } from "../../ts/typing";
import { FIELDTYPE, FieldValue, TRow, RowData } from '../../../ts/typing'
import { callJSFunction, isString } from "../../../ts/j";
import defaults from '../../../ts/defaults'
import './styles.css'
import { fieldType, transformOneColumn } from "../../ts/transcol";
import { getValue } from "../../ts/helper";

// =================================
// create ProColumns from columns
// =================================

export function transformColumns(cols: ColumnList, r: TableHookParam): ColumnType<any>[] {
  return (cols.columns as TColumn[]).map((c) => transformOneColumn(c, r, cols));
}

// ======================
// is mask clicked
// ======================
export function ismaskClicked(e: React.MouseEvent<HTMLElement>): boolean {
  const t: string = e.currentTarget.className
  return t === 'ant-modal-wrap'
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

function okfilter(p: ColumnList, r: TRow): boolean {
  const res: boolean = callJSFunction(p.filterJS as string, r);
  return res
}

export function filterDataSource(p: ColumnList, t: RowData) {
  return t.filter((e: TRow) => okfilter(p, e))
}
