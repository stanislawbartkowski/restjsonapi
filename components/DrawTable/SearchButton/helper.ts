import { ColumnList, TColumn, TField } from "../../ts/typing";

function convertColumn(t: TColumn): TField {
    return {
        field: t.field,
        coltitle: t.coltitle,
        fieldtype: t.fieldtype
    }
}

export function convertColumnsToFields(p: ColumnList): TField[] {
    return p.columns.filter(c => c.actions === undefined).map(c => convertColumn(c));
}

