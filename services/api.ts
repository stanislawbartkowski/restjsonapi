import request, { RequestOptionsInit, ResponseError } from "umi-request";

import type { FHeaderModifier, FieldValue, FUrlModifier } from "../ts/typing";
import { log, internalerrorlog, logG } from '../ts/l'
import { HTTPMETHOD } from "../ts/typing";
import { getAuthLabel, getSessionId, isgetCached } from "../ts/j";
import { getToken, getUserFullName, getUserName } from "../ts/keyclock";
import { emptys } from "../components/ts/helper";
import { isProd } from "../ts/readresource";
import { getDomain } from "../ts/url";


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

//export function getHost(): string {
//  return host;
//}

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
let headerModifier: FHeaderModifier | undefined = undefined;

export function setHeaderModifier(u: FHeaderModifier) {
  headerModifier = u;
}

export function setUrlModifier(u: FUrlModifier) {
  urlModifier = u
}

export function getUrlModifier(): FUrlModifier | undefined {
  return urlModifier
}

export function toEndPoint(endpoint: string, addHost: boolean = false) {
  const eurl: string = `${prefix}${endpoint}`;
  const url = addHost ? `${host}${eurl}` : eurl
  return url
}

function userHeader(): Record<string, string> {
  const sessionH: Record<string, string> = { 'sessionid': getSessionId() }
  const userH: Record<string, string> = (getUserName() === undefined) ? {} : { 'user': (encodeURIComponent(getUserName() as string)) }
  const usernameH: Record<string, string> = (getUserFullName() === undefined) ? {} : { 'username': (encodeURIComponent(getUserFullName() as string)) }
  const modifH: Record<string, string> = (headerModifier === undefined) ? {} : headerModifier()
  const authLabel: Record<string, string> = emptys(getAuthLabel()) ? {} : { 'authlabel': getAuthLabel() as string }
  const authorization: Record<string, string> = emptys(getToken()) ? {} : { 'Authorization': 'Bearer ' + getToken() }
  const domain: Record<string, string> = { 'domain': getDomain() }
  return {
    ...sessionH,
    ...userH,
    ...modifH,
    ...usernameH,
    ...authLabel,
    ...authorization,
    ...domain
  }
}

function userGetCache() {
  // cache 1 hour
  const u = isProd() ? { useCache: true, ttl: 3600000 } : undefined
  return u;
}

function getUserGetCache(list: string) {
  if (!isgetCached(list)) return undefined
  return userGetCache()
}

export async function restapilist(list: string, pars?: Record<string, FieldValue>) {
  const url: string = toEndPoint(list)
  const para: any = urlModifier === undefined ? {} : urlModifier(list);
  return rrequest<Record<string, any>>(url, {
    method: "GET",
    // 2024/06/27 - do not send cookies
    credentials: 'omit',
    params: { ...para, ...pars },
    headers: userHeader(),
    ...getUserGetCache(list)
  });
}

export async function restapishowdetils(resource: string) {
  return restapilistdef(resource);
}

export async function restapilistdef(resource: string) {
  // listdef
  const url: string = toEndPoint("compdef")
  return rrequest<Record<string, any>>(url, {
    method: "GET",
    params: { resource: resource },
    headers: userHeader(),
    ...userGetCache()
  });
}

export async function restapiresource(resource: string) {
  const url: string = toEndPoint("resource")
  return rrequest<Record<string, any>>(url, {
    method: "GET",
    params: { resource: resource },
    headers: userHeader()
  });
}

export async function restapijs(resource: string) {
  const url: string = toEndPoint("getjs")
  return rrequest<string>(url, {
    method: "GET",
    params: { resource: resource },
    headers: userHeader(),
    ...userGetCache()
  });
}

export async function restaction(method: HTTPMETHOD, restaction: string, pars?: Record<string, FieldValue>, data?: any, responseType?: RequestOptionsInit["responseType"]) {
  const url: string = toEndPoint(restaction)
  const para: any = urlModifier === undefined ? {} : urlModifier(restaction);
  return rrequest<Record<string, any>>(url, {

    method: method,
    data: data,
    getResponse: true,
    params: { ...para, ...pars },
    responseType: responseType,
    headers: userHeader(),
    ...(method === HTTPMETHOD.GET ? getUserGetCache(restaction) : undefined)
  });
}

// ------------------
// upload endpoint
// ------------------

export const customRequest = (options: any) => {
  fetch(options.action, {
    method: 'POST',
    body: options.file,
    headers: userHeader()
  }
  )
    .then(result => {
      console.log('Success:', result);
      options.onSuccess()
    })
    .catch(error => {
      console.error('Error:', error);
      options.onError()
    });

}