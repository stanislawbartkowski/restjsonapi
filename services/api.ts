// @ts-ignore
/* eslint-disable */
//import request, {extend} from 'umi-request';
import request, { ResponseError } from "umi-request";

import type { FieldValue, FUrlModifier } from "../ts/typing";
import { internalerrorlog, logG } from '../ts/l'
import { HTTPMETHOD } from "../ts/typing";

const rrequest = request;
let prefix: string = "/"

// /restapi

export function setPrefix(p: string) {
  prefix = p
}

export function setHost(prefix: string) {
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
  const para: any = urlModifier == undefined ? {} : urlModifier(list);
  return rrequest<Record<string, any>>(url, {
    method: "GET",
    ...{ params: { ...para, ...pars } },
  });
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
  return rrequest<Record<string, any>>(`${prefix}getjs`, {
    method: "GET",
    ...{ params: { resource: resource } },
  });
}

export async function restaction(method: HTTPMETHOD, restaction: string, pars?: Record<string, FieldValue>, data?: any) {
  const para: any = urlModifier == undefined ? {} : urlModifier(restaction);
  return rrequest<Record<string, any>>(`${prefix}${restaction}`, {
    method: method,
    data: data,
    ...{ params: { ...para, ...pars } },
  });
}
