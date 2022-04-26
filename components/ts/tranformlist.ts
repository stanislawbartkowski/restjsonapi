// ======================================
// transform list using getvalue
// ======================================

import { FIELDTYPE, TRow, FieldValue, OneRowData, RowData } from "../../ts/typing"
import { tomoney } from "../DrawTable/js/helper"
import { getValue } from "./helper"
import { fieldType } from "./transcol"
import { TColumn, ColumnValue, TColumns } from "./typing"

function transformCol(e: TColumn): boolean {
    return e.value !== undefined || fieldType(e) === FIELDTYPE.MONEY
}

function transformCell(c: TColumn, props: OneRowData): FieldValue {
    const val: FieldValue = c.value ? getValue(c.value as ColumnValue, props) : (props.r as TRow)[c.field]
    return fieldType(c) === FIELDTYPE.MONEY ? tomoney(val as string | number) : val
}


export function copyAndTransform(columns: TColumns, props: OneRowData): TRow {
    const nrow: TRow = columns.reduce<TRow>((m: TRow, e: TColumn) => { m[e.field] = transformCol(e) ? transformCell(e, props) : (props.r as TRow)[e.field]; return m }, {})
    return nrow
}

export function transformList(columns: TColumns, props: OneRowData) {

    const filteredCols: TColumns = columns.filter(e => transformCol(e))

    // only if there is something to transform
    if (filteredCols.length === 0) return

    const t: RowData = props.t as RowData

    t.forEach((r: TRow) => { filteredCols.forEach((c: TColumn) => { r[c.field] = transformCell(c, { r: r, vars: props.vars }) }) })
}

export function addRowKey(t : RowData, rowkey: string) {
    let number = 0
    t.forEach(e => e[rowkey] = number++)
}
