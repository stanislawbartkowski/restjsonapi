// ====================
// call JS function
// ====================

import type { OneRowData } from "./typing";

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
