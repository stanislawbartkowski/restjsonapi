// ======================================
// transform list using getvalue
// ======================================

import { RowData, FIELDTYPE, TRow, FieldValue } from "../../ts/typing"
import { tomoney } from "../DrawTable/js/helper"
import { getValue } from "./helper"
import { fieldType } from "./transcol"
import { TColumn, ColumnValue, TColumns } from "./typing"

function transformCol(e: TColumn): boolean {
    return e.value !== undefined || fieldType(e) === FIELDTYPE.MONEY
}

function transformCell(r: TRow, c: TColumn): FieldValue {
    const val: FieldValue = c.value ? getValue(c.value as ColumnValue, r) : r[c.field]
    return fieldType(c) === FIELDTYPE.MONEY ? tomoney(val as string | number) : val
}


export function copyAndTransform(r: TRow, columns: TColumns): TRow {
    const nrow: TRow = columns.reduce<TRow>((m: TRow, e: TColumn) => { m[e.field] = transformCol(e) ? transformCell(r, e) : r[e.field]; return m }, {})
    return nrow
}

export function transformList(t: RowData, columns: TColumns) {

    const filteredCols: TColumns = columns.filter(e => transformCol(e))

    // only if there is something to transform
    if (filteredCols.length === 0) return

    t.forEach((r: TRow) => { filteredCols.forEach((c: TColumn) => { r[c.field] = transformCell(r, c) }) })
}
