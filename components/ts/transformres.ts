
import { dateremoveT } from "../../ts/d";
import { FIELDTYPE, TRow } from "../../ts/typing";
import { FFieldElem } from "./helper";
import { fieldType } from "./transcol";
import { TField } from "./typing";

// =====================
// transform result
// =====================

function getValue(v: any, t: FFieldElem) {

    if (t.elemlist) {
        const vlist : TRow[] = v
        return vlist.map( r => transformValues(r,t.elemlist as FFieldElem[]))
    }
    const tt: FIELDTYPE = fieldType(t);
    if (tt !== FIELDTYPE.DATE) return v;
    if (v === undefined) return undefined
    if (t.range) {
        return [dateremoveT(v[0]), dateremoveT(v[1])]
    }
    return dateremoveT(v)
}

export function transformValues(row: TRow, tf: FFieldElem[]): TRow {
    const res: TRow = {}
    tf.forEach((t: FFieldElem) => {
        const fieldtype: FIELDTYPE = fieldType(t)
        if (row[t.field] !== undefined) {            
            res[t.field] = getValue(row[t.field], t)
        } else
            // undefined for boolean is false
            if (fieldtype === FIELDTYPE.BOOLEAN) res[t.field] = false
    })
    return res;
}
