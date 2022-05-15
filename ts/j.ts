// ====================
// call JS function
// ====================

import validateObject, { ObjectType } from "../components/ts/validateobject";
import { log } from "./l";
import lstring from "./localize";
import type { ButtonElem, FormMessage, OneRowData, TRow } from "./typing";

export function callJSFunction(jsAction: string, par: OneRowData): any {
  const clickaction = new Function("p,vars", "return " + jsAction + "(p,vars)");
  const res = clickaction(par.r, par.vars);
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

// ===============================
// origin
// ===============================

export function getOrigin(): [string, string] {
  return [window.location.hostname, window.location.port]
}

export function getOriginURL(): string {
  return window.location.origin;
}

export function isDev(): boolean {
  return process.env.NODE_ENV !== 'production'
}

// ==============================
// make message
// ==============================


export function makeMessage(m: FormMessage, pars: OneRowData = { r: {} }): string | undefined {
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

// ================================
// button name
// ================================

export function getButtonName(e: ButtonElem, vars?: TRow): string {
  if (e.name === undefined) return lstring(e.id)
  return makeMessage(e.name, { r: {}, vars: vars }) as string
}

