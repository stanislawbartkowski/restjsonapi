// ====================
// call JS function
// ====================

export function callJSFunction(jsAction: string, data: object, vars?: object): any {
  const clickaction = new Function('p,vars', 'return ' + jsAction + '(p,vars)');
  const res = clickaction(data, vars);
  return res;
}

// ============================================
// type checkers
// ============================================

export function isString(p: any): boolean {
  return typeof p === 'string';
}

export function isArray(p: any): boolean {
  return Array.isArray(p);
}

export function isNumber(p: any): boolean {
  return typeof p === 'number';
}

export function isBool(p: any): boolean {
  return typeof p === 'boolean';
}

export function isObject(p: any): boolean {
  return typeof p === 'object';
}
