import request, { extend, ResponseError } from "umi-request";

import type { FHeaderModifier, FieldValue, FUrlModifier } from "../ts/typing";
import { log, internalerrorlog, logG } from '../ts/l'
import { HTTPMETHOD } from "../ts/typing";
import { getSessionId } from "../ts/j";
import { getUserName } from "../ts/keyclock";


const rrequest = request;
//const rrequest = extend({
//  headers: {
//    'sessionid': getSessionId(),
//  }
//}
//)
let prefix: string = "/"

let host: string = ""

// /restapi

export function enhanceLink(url: string): string {
  const o = host;
  if (url.startsWith("/")) return `${o}${url}`
  else return `${o}/${url}`
}


export function setPrefix(p: string) {
  prefix = p
}

export function getHost(): string {
  return host;
}

export function setHost(prefix: string) {

  host = prefix
  log(`setHost ${prefix}`);
  function errorHandler(error: ResponseError) {
    internalerrorlog(error.message);
    logG.error(error.message, error)
    throw new Error(error.message)
  }
  rrequest.extendOptions({ prefix: prefix, errorHandler: errorHandler });
}

let urlModifier: FUrlModifier | undefined = undefined;
let headerModifier: FHeaderModifier| undefined = undefined;

export function setHeaderModifier(u : FHeaderModifier) {
  headerModifier = u;
}

export function setUrlModifier(u: FUrlModifier) {
  urlModifier = u
}

export function getUrlModifier(): FUrlModifier | undefined {
  return urlModifier
}

function userHeader() : Record<string,string> {
  const sessionH : Record<string,string> = {'sessionid': getSessionId()}
  const userH : Record<string,string> = (getUserName() === undefined) ? {} : {'user' : (getUserName() as string)}
  const modifH: Record<string,string> = (headerModifier === undefined) ? {} : headerModifier()
  return  {
      ...sessionH,
      ...userH,
      ...modifH
  }
}

export async function restapilist(list: string, pars?: Record<string, FieldValue>) {
  const url: string = `${prefix}${list}`;
  const para: any = urlModifier === undefined ? {} : urlModifier(list);
  return rrequest<Record<string, any>>(url, {
    method: "GET",
    params: { ...para, ...pars  },
    headers: userHeader()
  });
}

export async function restapishowdetils(resource: string) {
  return restapilistdef(resource);
}

export async function restapilistdef(resource: string) {
  // listdef
  return rrequest<Record<string, any>>(`${prefix}compdef`, {
    method: "GET",
    params: { resource: resource } ,
    headers: userHeader()
  });
}

export async function restapiresource(resource: string) {
  return rrequest<Record<string, any>>(`${prefix}resource`, {
    method: "GET",
    params: { resource: resource },
    headers: userHeader()
  });
}

export async function restapijs(resource: string) {
  return rrequest<string>(`${prefix}getjs`, {
    method: "GET",
    params: { resource: resource } ,
    headers: userHeader()
  });
}

export async function restaction(method: HTTPMETHOD, restaction: string, pars?: Record<string, FieldValue>, data?: any) {
  const para: any = urlModifier === undefined ? {} : urlModifier(restaction);
  return rrequest<Record<string, any>>(`${prefix}${restaction}`, {

    method: method,
    data: data,
    getResponse: true, 
    params: { ...para, ...pars },
    headers: userHeader()
  });
}

