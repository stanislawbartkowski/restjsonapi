// ====================
// call JS function
// ====================

import { BUTTONACTION } from "../components/ts/typing";
import defaults from "./defaults";
import { log } from "./l";
import lstring from "./localize";
import { getAppData } from "./readresource";
import type { AppData, ButtonElem, FieldValue, FormMessage, OneRowData, TRow } from "./typing";
import { getRouterRoot } from "./url";

export function callJSFunction(jsAction: string, par: OneRowData): any {
  const clickaction = new Function("p,vars,t", "return " + jsAction + "(p,vars,t)");
  const res = clickaction(par.r, par.vars, par.t);
  return res;
}

// ============================================
// type checkers
// ============================================

export function isEmpty(o: object) {
  for (const property in o) return false;
  return true;
}

export function isString(p: any): boolean {
  return typeof p === "string";
}

export function isOArray(p: any): boolean {
  return Array.isArray(p);
}

export function isNumber(p: any): boolean {
  return typeof p === "number";
}

export function isBool(p: any): boolean {
  return typeof p === "boolean";
}

export function isObject(p: any): boolean {
  return typeof p === "object";
}

export function toS(f: FieldValue): string {
  const value: string = isNumber(f) ? (f as number)?.toString() : f as string
  return value
}

export function isNumericString(s: string) {
  return typeof s === 'string' && !isNaN(parseInt(s))
}

export function isnotdefined(t: any): boolean {
  return t === undefined || t === null;
}


// ==============================
// make message
// ==============================


export function makeMessage(m: FormMessage, pars: OneRowData = { r: {} }): string | undefined {

  if (isString(m)) {
    const mm: string = m as string
    if (mm.startsWith(defaults.directprefix)) return mm.substring(defaults.directprefix.length)
    return lstring(m as string)
  }

  if (m.messagedirect) return m.messagedirect;

  if (m.js) {
    const res: any = callJSFunction(m.js, pars);
    if (res === undefined) return undefined
    // recursive !
    return makeMessage(res as FormMessage, pars);
  }
  if (m.message) return lstring(m.message, m.params);
  log("makeMessage - incorrect FomrMessage parameter");
  return undefined;
}

// ================================
// button name
// ================================


function standardButton(id: BUTTONACTION): [string | undefined, string | undefined] {
  let messid: string | undefined = undefined
  let iconid: string | undefined = undefined
  if (id === undefined) return [undefined, undefined]
  switch (id) {
    case BUTTONACTION.ADD:
      messid = "addaction";
      iconid = "pluscircleoutlined";
      break;
    case BUTTONACTION.ACCEPT:
      messid = 'acceptaction';
      break;
    case BUTTONACTION.CANCEL:
      messid = 'cancelaction';
      break;
    case BUTTONACTION.DEL:
      messid = 'delete';
      iconid = 'deleteoutlined';
      break;
    case BUTTONACTION.UPDATE:
      messid = 'update'
      iconid = 'editoutlines'
      break
    case BUTTONACTION.PRINT:
      messid = 'print'
      iconid = 'printoutlined'
      break
    case BUTTONACTION.DOPRINT:
      messid = 'doprint'
      iconid = 'printoutlined'
      break
    case BUTTONACTION.CHOOSE:
      messid = 'chooseaction'
      iconid = 'checkoutlined'
      break;
    case BUTTONACTION.NEXT:
      messid = 'next'
      iconid = 'stepsforwardoutlined'
      break;
    case BUTTONACTION.PREV:
      messid = 'prev'
      iconid = 'stepsbackwardoutlined'
      break;
    case BUTTONACTION.UPLOAD:
      messid = 'upload'
      iconid = 'uploadoutlined'
      break;
    case BUTTONACTION.OK:
      messid = 'ok';
      iconid = 'checkoutlined';
      break
    case BUTTONACTION.SEARCH:
      messid = 'search';
      iconid = 'searchoutlined'
      break;
    case BUTTONACTION.SEARCHNEXT:
      messid = 'searchnext';
      iconid = 'forwardoutlined'
      break;
    case BUTTONACTION.DOWNLOAD:
      messid = 'download';
      iconid = 'downloadoutlined'
      break;

  }
  return [messid, iconid]

}

export function getButtonNameIcon(e: ButtonElem, vars?: TRow): [string, string | undefined] {
  if (e.name === undefined) {
    const [n, i] = standardButton(e.id as BUTTONACTION)
    if (n !== undefined) {
      return [lstring(n), e.icon === undefined ? i : e.icon]
    }
    return [lstring(e.id), e.icon]
  }
  return [makeMessage(e.name, { r: {}, vars: vars }) as string, e.icon]
}

export function getButtonName(e: ButtonElem, vars?: TRow): string {
  const [name, _] = getButtonNameIcon(e, vars)
  return name
}


// ===============================
// random session id
// ===============================

const sessionid: string = generateID()

export function getSessionId() {
  return sessionid
}

function generateID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  })
}

// ==============================
// global vars
// ==============================

export function commonVars(): TRow {
  return { "sessionid": getSessionId() }
}

// ==============================

export function copyMap(m: Map<any, any>): Map<any, any> {

  const mm: Map<any, any> = new Map();

  for (let [key, val] of m) {
    mm.set(key, val)
  }
  return mm;
}

// ==========================
// init sec
// ==========================

let issec: boolean = false

export function setSec(sec: boolean) {
  issec = sec
}

export function isSec(): boolean {
  return issec
}

// ========================
// authlabel
// ========================

let authlabel: string | undefined = undefined;

export function setAuthLabel(auth: string) {
  authlabel = auth;
}

export function getAuthLabel(): string | undefined {
  return authlabel;
}

// ========================

function isRegOnList(s: string, reglist: string[] | undefined): boolean {
  if (reglist === undefined) return false;
  for (let i = 0; i < reglist.length; i++) {
    const r: string = reglist[i]
    if (s.match(r)) return true
  }
  return false
}

export function isgetCached(g: string): boolean {
  const a: AppData = getAppData()
  if (isRegOnList(g, a.getcacheexclude)) return false
  return isRegOnList(g, a.getcacheinclude)
}

export function removeDomain(id: string): string {
  const r: string = getRouterRoot()
  return id.substring(r.length)
}

// ==================
export function getFieldValue(r: TRow, field: string): FieldValue | undefined {

    if (r == undefined || field === undefined) return undefined
    const i: number = field.indexOf('.')
    if (i === -1) return r[field]
    const zmie: string = field.slice(0, i)
    const fie: string = field.slice(i + 1)
    const o: TRow = (r[zmie] as any) as TRow
    if (o === undefined || !isObject(o)) return undefined
    return o[fie]
}
