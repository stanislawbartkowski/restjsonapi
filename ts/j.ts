// ====================
// call JS function
// ====================

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

export function getButtonName(e: ButtonElem, vars?: TRow): string {
  if (e.name === undefined) return lstring(e.id)
  return makeMessage(e.name, { r: {}, vars: vars }) as string
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
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
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

export function removeDomain(id: string) : string {
  const r : string = getRouterRoot()
  return id.substring(r.length)
}