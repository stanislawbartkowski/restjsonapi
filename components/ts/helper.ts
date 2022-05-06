import { callJSFunction, isObject, makeMessage } from "../../ts/j";
import { FieldValue, OneRowData, PropsType, TRow } from "../../ts/typing";
import { ActionResult, ButtonAction, ClickResult, ColumnList, ColumnValue, ShowDetails, TAction, TColumn } from "./typing";
import { CSSProperties } from "react";

// =================
// header
// =================
export function makeHeader(p: ColumnList, unheader: string | undefined, pars: OneRowData): string | undefined {

    const title: string | undefined = p.headertitle
        ? makeMessage(p.headertitle, pars)
        : unheader

    return title
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

// ======================
// is mask clicked
// ======================
export function ismaskClicked(e: React.MouseEvent<HTMLElement>): boolean {
    const t: string = e.currentTarget.className
    return t === 'ant-modal-wrap'
}

// ==============================
// space for print content
// ==============================

type PrintResult = {
    result: ActionResult, 
    content: string
    button: ButtonAction
}

let content: PrintResult|undefined = undefined

export function setPrintContent(c: PrintResult) {
    content = c;
}

export function getPrintContent(): PrintResult {
    return content as PrintResult
}




