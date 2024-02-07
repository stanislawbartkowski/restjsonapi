// ======================================
// transform list using getvalue
// ======================================

import { dateNormalizeS, dateremoveT } from "../../ts/d"
import defaults from "../../ts/defaults"
import { FIELDTYPE, TRow, FieldValue, OneRowData, RowData } from "../../ts/typing"
import { getValue, getafterdot, tomoney } from "./helper"
import { fieldType, getVal } from "./transcol"
import { TColumn, ColumnValue, TColumns } from "./typing"

function transformCol(e: TColumn): boolean {
    return e.value !== undefined || fieldType(e) === FIELDTYPE.MONEY || fieldType(e) == FIELDTYPE.DATE
}

function moneydot(c: TColumn, props: OneRowData): number {
    const vars: TRow | undefined = props.vars
    if (vars === undefined) return defaults.moneydot
    const moneydot: string | undefined = vars[defaults.moneydotvar] as string
    return getafterdot(c.moneydot, moneydot)
}

export function transformCell(c: TColumn, props: OneRowData): FieldValue {
    const val: FieldValue = c.value ? getValue(c.value as ColumnValue, props) : getVal(c, props)
    if (fieldType(c) === FIELDTYPE.MONEY) return tomoney(val as string | number, moneydot(c, props))
    if (fieldType(c) == FIELDTYPE.DATE) return dateNormalizeS(val as string)
    return val
}


export function copyAndTransform(columns: TColumns, props: OneRowData): TRow {
    const nrow: TRow = columns.reduce<TRow>((m: TRow, e: TColumn) => { m[e.field] = transformCol(e) ? transformCell(e, { r: { ...props.r, ...m }, vars: props.vars }) : getVal(e, props); return m }, {})
    return nrow
}

export function transformList(columns: TColumns, props: OneRowData) {

    const filteredCols: TColumns = columns.filter(e => transformCol(e))

    // only if there is something to transform
    if (filteredCols.length === 0) return

    const t: RowData = props.t as RowData

    t.forEach((r: TRow) => { filteredCols.forEach((c: TColumn) => { r[c.field] = transformCell(c, { r: r, vars: props.vars }) }) })
}

export function addRowKey(t: RowData | undefined, rowkey: string) {
    if (t === undefined) return
    let num: number = 0
    t.forEach(e => e[rowkey] = num++)
}

