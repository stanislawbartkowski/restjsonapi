import request, { ResponseError } from "umi-request";

import type { FieldValue, FUrlModifier } from "../ts/typing";
import { log, internalerrorlog, logG, erralert } from '../ts/l'
import { HTTPMETHOD } from "../ts/typing";
import { getOrigin, getOriginURL } from "../ts/j";

const rrequest = request;
let prefix: string = "/"

// /restapi

export function setPrefix(p: string) {
  prefix = p
}

export function setHost(prefix: string) {

  log(`setHost ${prefix}`);
  function errorHandler(error: ResponseError) {
    internalerrorlog(error.message);
    logG.error(error.message, error)
    throw new Error(error.message)
  }
  rrequest.extendOptions({ prefix: prefix, errorHandler: errorHandler });
}

let urlModifier: FUrlModifier | undefined = undefined;

export function setUrlModifier(u: FUrlModifier) {
  urlModifier = u
}

export async function restapilist(list: string, pars?: Record<string, FieldValue>) {
  const url: string = `${prefix}${list}`;
  const para: any = urlModifier === undefined ? {} : urlModifier(list);
  return rrequest<Record<string, any>>(url, {
    method: "GET",
    ...{ params: { ...para, ...pars } },
  });
}

export async function restapishowdetils(resource: string) {
  return restapilistdef(resource);
}

export async function restapilistdef(resource: string) {
  // listdef
  return rrequest<Record<string, any>>(`${prefix}compdef`, {
    method: "GET",
    ...{ params: { resource: resource } },
  });
}

export async function restapiresource(resource: string) {
  return rrequest<Record<string, any>>(`${prefix}resource`, {
    method: "GET",
    ...{ params: { resource: resource } },
  });
}

export async function restapijs(resource: string) {
  return rrequest<string>(`${prefix}getjs`, {
    method: "GET",
    ...{ params: { resource: resource } },
  });
}

export async function restaction(method: HTTPMETHOD, restaction: string, pars?: Record<string, FieldValue>, data?: any) {
  const para: any = urlModifier === undefined ? {} : urlModifier(restaction);
  return rrequest<Record<string, any>>(`${prefix}${restaction}`, {
    
    method: method,
    data: data,
    ...{ getResponse: true, params: { ...para, ...pars } },
  });
}

export async function getPagePort() {

  const url: string = getOriginURL();
  const urll : string = `${url}/PORT`

  log(`Fething ${urll}`)

  const response = await fetch(urll);
  const data = await response.text()
  log(`Receiving ${data}`)
  // verify number
  const port : number = +data
  if (isNaN(port)) {
    internalerrorlog(`Incorrect value as port number received, number expected`)
  }
  return port;
}

