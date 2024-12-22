import { dateremoveT, dateparseS } from "../../ts/d";
import { FIELDTYPE, TRow, RowData, FieldValue } from "../../ts/typing";
import { FFieldElem, flattenTForm, genColIdedit, genEditClickedRowKey, getEditList, isEditList } from "./helper";
import { fieldType } from "./transcol";
import { TField } from "./typing";


// =====================
// transform result
// =====================

function datetransform(v: any, from: boolean) {
    if (from) return dateremoveT(v)
    return dateparseS(v)
}

export function transformSingleValue(v: any, t: FFieldElem, from: boolean) {

    if (t.elemlist) {
        const vlist: TRow[] = v
        return vlist.map(r => transformValues(r, t.elemlist as FFieldElem[], from))
    }
    const tt: FIELDTYPE = fieldType(t);
    if (tt !== FIELDTYPE.DATE) return v;
    if (v === undefined) return undefined
    if (t.range) {
        return v === undefined ? undefined : [datetransform(v[0], from), datetransform(v[1], from)]
    }
    return datetransform(v, from)
}

function transformValues(row: TRow, tf: FFieldElem[], from: boolean, initvalsedit?: TRow): TRow {
    const res: TRow = {}
    // 2022/08/28 --- !!! is supposed to throw exception
    // otherwise the list is not preserving rows while removing row
    // TODO: required investigation
    //if (row === undefined) return {}
    tf.forEach((t: FFieldElem) => {
        if (row[t.field] !== undefined) {
            res[t.field] = transformSingleValue(row[t.field], t, from)
        }
        // Added 2023/10/14 - can be set to undefined in the Form
        //if ((row[t.field] === undefined) && from && !isEditList(t)) res[t.field] = undefined

        if (isEditList(t) && from) {
            const ta: RowData | undefined = getEditList(t.field, initvalsedit as TRow)
            const newta: RowData = []
            if (ta !== undefined) {
                //const items: TField[] = t.items as TField[]                
                const items: TField[] = flattenTForm(t.items as TField[])

                for (let rowkey = 0; rowkey < ta.length; rowkey++) {
                    const r: TRow = ta[rowkey]
                    for (let f of items) {
                        const id: string = genColIdedit(t.field, f.field, rowkey)
                        if (row[id] !== undefined) r[f.field] = transformSingleValue(row[id], f, from)
                    }
                    newta.push(r)
                }
                // TODO: something strange here, requires attention, it modifies initvalsedit which is not correct
                // res[t.field] = (newta as any) as FieldValue
            }
            const l = genEditClickedRowKey(t.field)
            // Data: 2023/01/05
            const rowkey: number | undefined = row[l] as number
            if (rowkey !== undefined) {
                res[l] = rowkey
                // Data: 2023/02/02
                // copy content of the current row - risky
                if (rowkey < newta.length) {
                    const row: TRow = newta[rowkey]
                    const items: TField[] = t.items as TField[]
                    for (let f of items) {
                        res[f.field] = row[f.field]
                    }
                }
            }

        }
        if (isEditList(t) && !from) {
            const ta: RowData | undefined = getEditList(t.field, row)
            if (ta !== undefined) {
                //const items: TField[] = t.items as TField[]
                const items: TField[] = flattenTForm(t.items as TField[])
                for (let rowkey = 0; rowkey < ta.length; rowkey++) {
                    const r: TRow = ta[rowkey]
                    for (let f of items) {
                        const id: string = genColIdedit(t.field, f.field, rowkey)
                        const v: FieldValue = r[f.field]
                        res[id] = transformSingleValue(v, f, from)
                    }
                }

            }

        }

    })

    return res;
}

// Form -> Outside
export function transformValuesFrom(row: TRow, tf: FFieldElem[], initvalsedit?: TRow): TRow {
    return transformValues(row, tf, true, initvalsedit);
}

export function transformValuesTo(row: TRow, tf: FFieldElem[]): TRow {
    return transformValues(row, tf, false);
}
