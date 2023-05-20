import { create } from "domain"
import { FIELDTYPE, RowData, TRow } from "../../../ts/typing"
import { fieldTitle } from "../../ts/transcol"
import { fieldType } from "../../ts/transcol"
import { ColumnList, TColumn, TColumns } from "../../ts/typing"
import { visibleColumnsR } from "../js/helper"
import { ColumnsT } from "../typing"

type ExcelType = "log" | "string" | "int" | "money" | "date"

interface ExcelParams {
    withheader?: boolean
}

interface SchemaExcel {
    field: string,
    title?: string,
    type: ExcelType
}

interface ExcelData {
    schema: SchemaExcel[],
    list: RowData
    params?: ExcelParams
}

function toType(c: TColumn): ExcelType {
    const t: FIELDTYPE = fieldType(c)
    switch (t) {
        case FIELDTYPE.NUMBER: return "int"
        case FIELDTYPE.DATE: return "date"
        case FIELDTYPE.MONEY: return "money"
        case FIELDTYPE.BOOLEAN: return "log"
        default: return "string"
    }
}

function toTitle(c: TColumn, vars?: TRow): string | undefined {
    return fieldTitle(c, { r: {}, vars: vars })
}

function createSchema(cols: ColumnList, r_cols?: ColumnsT, vars?: TRow): SchemaExcel[] {
    const vcols: TColumns = visibleColumnsR(cols, r_cols)
    return vcols.filter(c => c.actions === undefined && c.tags === undefined).map(c => {
        return {
            field: c.field,
            type: toType(c),
            title: toTitle(c, vars)
        }

    })

}

export function generateExcelData(cols: ColumnList, rows: RowData, r_cols?: ColumnsT, vars?: TRow): ExcelData {
    return {
        schema: createSchema(cols, r_cols, vars),
        list: rows,
        params: {
            withheader: true
        }
    }
}