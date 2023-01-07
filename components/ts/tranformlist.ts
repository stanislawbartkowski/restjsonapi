// ======================================
// transform list using getvalue
// ======================================

import { FIELDTYPE, TRow, FieldValue, OneRowData, RowData } from "../../ts/typing"
import { getValue, tomoney } from "./helper"
import { fieldType, getVal } from "./transcol"
import { TColumn, ColumnValue, TColumns } from "./typing"

function transformCol(e: TColumn): boolean {
    return e.value !== undefined || fieldType(e) === FIELDTYPE.MONEY
}


export function transformCell(c: TColumn, props: OneRowData): FieldValue {
    const val: FieldValue = c.value ? getValue(c.value as ColumnValue, props) : getVal(c, props)
    return fieldType(c) === FIELDTYPE.MONEY ? tomoney(val as string | number) : val
}


export function copyAndTransform(columns: TColumns, props: OneRowData): TRow {
    const nrow: TRow = columns.reduce<TRow>((m: TRow, e: TColumn) => 
         { m[e.field] = transformCol(e) ? transformCell(e, { r: {...props.r,...m}, vars: props.vars }) : getVal(e, props); return m }, {})
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
    let num : number = 0
    t.forEach(e => e[rowkey] = num++)
}
