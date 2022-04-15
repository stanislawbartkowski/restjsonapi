import { callJSFunction, isObject } from "../../ts/j";
import { log } from "../../ts/l";
import lstring from "../../ts/localize";
import { FieldValue, PropsType, RowData, TRow } from "../../ts/typing";
import validateObject, { ObjectType } from "./validateobject";
import { ClickResult, ColumnList, ColumnValue, FormMessage, ShowDetails, TAction, TColumn } from "./typing";
import { CSSProperties } from "react";

// =================
// header
// =================
export function makeHeader(p: ColumnList, unheader: string | undefined, vars?: any): string | undefined {

    const title: string | undefined = p.header
        ? makeMessage(p.header, {}, vars)
        : unheader

    return title
}

// =========================================
// message from object
// =========================================

export function makeMessage(m: FormMessage, row?: TRow, vars?: any): string | undefined {
    if (m.messagedirect) return m.messagedirect;

    if (m.js) {
        const res: any = callJSFunction(m.js, row, vars);
        // recursive !
        validateObject(ObjectType.FORMMESSAGE, `js: ${m.js}`, res)
        return makeMessage(res as FormMessage, row, vars);
    }
    if (m.message) return lstring(m.message, m.params);
    log("makeMessage - incorrect FomrMessage parameter");
    return undefined;
}

// =====================
// misc functions
// =====================
export function isCard(c: ColumnList): boolean {
    return c.iscard === true
}

// ======================
// find details columns
// ======================
export function findColDetails(c: ColumnList): TColumn | undefined {
    return c.columns.find((x) => x.showdetails);
}

export function detailsTitle(c: ColumnList, row: TRow): [boolean,string | undefined, PropsType|undefined] {

    const C: TColumn | undefined = findColDetails(c)
    if (C === undefined) return [false,undefined, undefined]
    if (!isObject(C.showdetails))
        return c.rowkey ? [true, row[c.rowkey] as string ,undefined] : [false,undefined, undefined]
    const s: ShowDetails = C.showdetails as ShowDetails
    if (s.title === undefined) return [false,undefined,s.props]
    return [false,makeMessage(s.title, row),s.props]
}


// =================
// action
// =================
export function clickAction(t: TAction, row: TRow): ClickResult {
    let res: ClickResult = t;
    if (t.jsclick) res = callJSFunction(t.jsclick as string, row);
    return res;
}

// ================
//  custom value
// ================

export function getValue(a: ColumnValue, row: TRow | RowData): FieldValue {
    if (a.js) {
        const v: ColumnValue | undefined = callJSFunction(a.js as string, row);
        if (v === undefined) return undefined;
        // recursive
        return getValue(v, row);
    }
    if (a.value) return a.value;
    return makeMessage(a, row as TRow);
}

// =============================
// concat style with props 
// =============================

export function appendStyle(props: PropsType | undefined, c: CSSProperties): PropsType {
    const styleC = props?.style ? props?.style : {}
    return { ...props, style: { ...styleC, ...c } }
}



