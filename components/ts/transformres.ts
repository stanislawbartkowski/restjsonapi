import { dateremoveT, dateparseS } from "../../ts/d";
import { FIELDTYPE, TRow } from "../../ts/typing";
import { FFieldElem } from "./helper";
import { fieldType } from "./transcol";

// =====================
// transform result
// =====================

function datetransform(v: any, from: boolean) {
    if (from) return dateremoveT(v)
    return dateparseS(v)
}

function getValue(v: any, t: FFieldElem, from: boolean) {

    if (t.elemlist) {
        const vlist: TRow[] = v
        return vlist.map(r => transformValues(r, t.elemlist as FFieldElem[], from))
    }
    const tt: FIELDTYPE = fieldType(t);
    if (tt !== FIELDTYPE.DATE) return v;
    if (v === undefined) return undefined
    if (t.range) {
        return [datetransform(v[0], from), datetransform(v[1], from)]
    }
    return datetransform(v, from)
}

function transformValues(row: TRow, tf: FFieldElem[], from: boolean): TRow {
    const res: TRow = {}
    tf.forEach((t: FFieldElem) => {
        //        const fieldtype: FIELDTYPE = fieldType(t)
        if (row[t.field] !== undefined) {
            res[t.field] = getValue(row[t.field], t, from)
        } //else
        // undefined for boolean is false
        //if (fieldtype === FIELDTYPE.BOOLEAN) res[t.field] = false
        // zmiana: 2022/05/20 -- undefined for false is undefined, necessary for searching
    })
    return res;
}

export function transformValuesFrom(row: TRow, tf: FFieldElem[]): TRow {
    return transformValues(row, tf, true);
}

export function transformValuesTo(row: TRow, tf: FFieldElem[]): TRow {
    return transformValues(row, tf, false);
}
