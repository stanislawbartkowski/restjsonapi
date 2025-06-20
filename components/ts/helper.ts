import React, { CSSProperties } from "react";

import { callJSFunction, isNumericString, isObject, isString, isnotdefined, makeMessage } from "../../ts/j";
import { FieldValue, OneRowData, PropsType, RowData, TBooleanField, TRow } from "../../ts/typing";
import { ActionResult, ButtonAction, ColumnList, ColumnValue, PreseForms, ShowDetails, StepsForm, TAction, TCard, TColSortType, TColumn, TColumns, TField, TForm, TPreseEnum } from "./typing";
import defaults from "../../ts/defaults";
import { HTMLElem } from "./transcol";


// =================
// header
// =================

export function makeHeaderString(p: ColumnList, unheader: string | undefined, pars: OneRowData): string | undefined {

    const title: string | undefined = p.headertitle
        ? makeMessage(p.headertitle, pars)
        : unheader

    if (title === undefined) return undefined

    return title
}

export function isFieldTrue(bvalue: TBooleanField | undefined, par: OneRowData) {
    let hidden: boolean | undefined = bvalue
    if (bvalue?.js !== undefined) {
        hidden = callJSFunction(bvalue.js, par)
    }
    return istrue(hidden)
}

export function makeHeader(p: ColumnList, unheader: string | undefined, pars: OneRowData): React.ReactNode | undefined {

    const title: string | undefined = makeHeaderString(p, unheader, pars)

    if (title === undefined) return undefined

    return HTMLElem(title)
}

export function removeHTMLtags(s: string): string {
    return s.replace(/(<([^>]+)>)/ig, '');
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
        return c.rowkey ? [true, (pars.r as TRow)[C.field] as string, undefined] : [false, undefined, undefined]
    const s: ShowDetails = C.showdetails as ShowDetails
    if (s.title === undefined) return [false, undefined, s.props]
    return [false, makeMessage(s.title, pars), s.props]
}

export function getRowKey(c: ColumnList): string {
    const rowkey: string = c.rowkey ? c.rowkey : defaults.rowkeyS
    return rowkey
}

export function isColumnAction(c: TColumn): boolean {
    if (c === undefined || c.actions === undefined) return false
    return !c.actions.showindetails
}


// =================
// action
// =================
export function clickAction(t: TAction, pars: OneRowData): TAction {
    let res: TAction = t;
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
    if (a.value !== undefined) return a.value;
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

export type PrintResult = {
    result: ActionResult,
    content: string
    button: ButtonAction
}

let content: PrintResult | undefined = undefined

export function setPrintContent(c: PrintResult) {
    content = c;
}

export function getPrintContent(): PrintResult {
    return content as PrintResult
}


// ========================

export function emptys(t: string | undefined): boolean {
    return isnotdefined(t) || t?.trim() === ""
}

export function istrue(t: boolean | undefined): boolean {
    if (isnotdefined(t)) return false;
    return t as boolean
}

export function isfalse(t: boolean | undefined): boolean {
    if (isnotdefined(t)) return false;
    return !(t as boolean)
}

export function tomoney(t: string | number | undefined, moneydot: number): undefined | string {
    if (isnotdefined(t)) return undefined
    if (moneydot < 0) moneydot = 0
    if (isString(t)) return (+(t as string | number)).toFixed(moneydot)
    return (t as number).toFixed(moneydot)
}

export function okmoney(t: string): boolean {
    const res = tomoney(t, defaults.maxmenoeydot)
    return res !== "NaN"
}

export function stoint(s: FieldValue): number {
    const num: number = +(s as string)
    return Math.round(num)
}

export function getafterdot(f?: string, moneydot?: string) {
    if (f === undefined || emptys(moneydot)) return defaults.moneydot
    const entries: string[] = (moneydot as string).split(",")
    for (var e of entries) {
        const a = e.split(':')
        if (a.length === 2 && a[0] === f) return +a[1]
    }
    return defaults.moneydot
}


// =====================================

// =========================
// HTML content
// =========================


export type FFieldElem = TField & {
    elemlist?: FFieldElem[];

}

export function isItemGroup(t: TField): boolean {
    return t.items !== undefined
}

function isList(t: TField): boolean {
    return t.list !== undefined
}

export function isEditList(t: TField): boolean {
    return t.items !== undefined && t.editlist !== undefined
}

export function flattenTForm(tlist: TField[]): FFieldElem[] {
    let res: FFieldElem[] = []

    tlist.forEach(t => {
        const e: FFieldElem = { ...t }
        if (isItemGroup(t) && !isEditList(t)) {
            const i: FFieldElem[] = flattenTForm(t.items as TField[])
            if (isList(t)) e.elemlist = i;
            else {
                res = res.concat(i);
                return
            }
        }
        if (t.collapse) {
            t.collapse.forEach(p => {
                const i: FFieldElem[] = flattenTForm(p.items)
                res = res.concat(i)
            })
            return
        }
        if (t.tab?.tabs) {
            t.tab.tabs.forEach(p => {
                const i: FFieldElem[] = flattenTForm(p.items)
                res = res.concat(i)
            })
            res.push(t)
            return
        }
        res.push(e)
    })
    return res
}

// ===================================
// card props
// ===================================

export function cardProps(p?: TCard) {
    if (p === undefined) return undefined
    const title = p?.title ? { title: makeMessage(p.title) } : {}
    const cardprops = p?.cardprops ? { ...p.cardprops } : undefined
    return {
        ...title,
        ...cardprops
    }
}

// ======================================
// visible columns 
// ======================================


function includeColumn(col: TColumn, removeactions?: boolean): boolean {
    if (removeactions && col.actions !== undefined) return false;
    return !istrue(col.tablenodef)
}

export function visibleColumns(cols: TColumns, removeactions?: boolean): TColumns {
    return cols.filter(e => includeColumn(e, removeactions))
}


// ======================
// different prese types
// ======================

export function preseT(p: PreseForms): TPreseEnum {
    return (p as any as StepsForm).steps !== undefined ? TPreseEnum.Steps : (p as TForm).fields !== undefined ? TPreseEnum.TForm : TPreseEnum.ColumnList
}

// =================================
// compose and decompose edit list
// =================================


export function genColIdedit(editid: string, field: string, rowkey: number): string {
    return editid + "_" + field + "_" + rowkey
}

export function genEditClickedRowKey(editid: string): string {
    return editid + "_rowkey"
}

export function decomposeEditId(id: string): [string, string, number] | undefined {
    const f: number = id.indexOf('_')
    if (f === -1) return undefined
    const l: number = id.lastIndexOf('_')
    if (f === l) return undefined
    const ta: string = id.substring(0, f)
    const fie: string = id.substring(f + 1, l)
    const nums = id.substring(l + 1)
    // 2023/09/09 - only if last segment is a number
    if (!isNumericString(nums)) return undefined
    const num: number = +nums
    return [ta, fie, num]
}


export function getEditList(editid: string, r: TRow): RowData | undefined {
    const values: RowData | undefined = (r[editid] as any) as RowData
    return values
}

export function findEditField(field: string, t: TField[]): TField | undefined {
    const d = decomposeEditId(field)
    if (d === undefined) return undefined
    const editit: TField | undefined = t.find(t => t.field === d[0])
    if (editit === undefined) return undefined
    const e: TField | undefined = editit.items?.find(t => t.field === d[1])
    return e
}

// =============================
// sum elements
// =============================

export function sumnumbers(t: RowData, f: string): string {
    const s: number = t.reduce((a: number, b: TRow) => a + (b[f] ? +(b[f] as string | number) : 0), 0)
    return tomoney(s, defaults.moneydot) as string
}

// ==========================
// combine props and styles
// ==========================

export function combineProps(p1?: PropsType, p2?: PropsType): PropsType {
    if (p1 === undefined) return { ...p2 }
    if (p2 === undefined) return { ...p1 }
    const style = {
        ...p1.style,
        ...p2.style
    }
    return { ...p1, ...p2, style: style }
}

// ===============

export function dajTList(t: TColSortType): string[] {
    if (isString(t)) return [t as string]
    return t as string[]
}