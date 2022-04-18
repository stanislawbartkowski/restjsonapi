import { callJSFunction, isObject } from "../../ts/j";
import { log } from "../../ts/l";
import lstring from "../../ts/localize";
import { FieldValue, OneRowData, PropsType, TRow } from "../../ts/typing";
import validateObject, { ObjectType } from "./validateobject";
import { ClickResult, ColumnList, ColumnValue, FormMessage, ShowDetails, TAction, TColumn } from "./typing";
import { CSSProperties } from "react";

// =================
// header
// =================
export function makeHeader(p: ColumnList, unheader: string | undefined, pars: OneRowData): string | undefined {

    const title: string | undefined = p.header
        ? makeMessage(p.header, pars)
        : unheader

    return title
}

// =========================================
// message from object
// =========================================

export function makeMessage(m: FormMessage, pars: OneRowData): string | undefined {
    if (m.messagedirect) return m.messagedirect;

    if (m.js) {
        const res: any = callJSFunction(m.js, pars);
        // recursive !
        validateObject(ObjectType.FORMMESSAGE, `js: ${m.js}`, res)
        return makeMessage(res as FormMessage, pars);
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

export function detailsTitle(c: ColumnList, pars: OneRowData): [boolean, string | undefined, PropsType | undefined] {

    const C: TColumn | undefined = findColDetails(c)
    if (C === undefined) return [false, undefined, undefined]
    if (!isObject(C.showdetails))
        return c.rowkey ? [true, (pars.r as TRow)[c.rowkey] as string, undefined] : [false, undefined, undefined]
    const s: ShowDetails = C.showdetails as ShowDetails
    if (s.title === undefined) return [false, undefined, s.props]
    return [false, makeMessage(s.title, pars), s.props]
}


// =================
// action
// =================
export function clickAction(t: TAction, pars: OneRowData): ClickResult {
    let res: ClickResult = t;
    if (t.jsclick) res = callJSFunction(t.jsclick as string, pars);
    return res;
}

// ================
//  custom value
// ================

export function getValue(a: ColumnValue, pars: OneRowData): FieldValue {
    if (a.js) {
        const v: ColumnValue | undefined = callJSFunction(a.js as string, pars);
        if (v === undefined) return undefined;
        // recursive
        return getValue(v, pars);
    }
    if (a.value) return a.value;
    return makeMessage(a, pars);
}

// =============================
// concat style with props 
// =============================

export function appendStyle(props: PropsType | undefined, c: CSSProperties): PropsType {
    const styleC = props?.style ? props?.style : {}
    return { ...props, style: { ...styleC, ...c } }
}



