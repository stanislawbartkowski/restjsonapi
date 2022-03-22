// @ts-ignore
/* eslint-disable */
//import request, {extend} from 'umi-request';
import request, { extend, ResponseError } from "umi-request";

import type { FUrlModifier } from "../ts/typing";
import { internalerrorlog } from '../ts/j'

const rrequest = request;
let prefix : string = "/"

// /restapi

export function setPrefix(p : string) {
  prefix = p
}

export function setHost(prefix: string) {
  function errorHandler(error: ResponseError) {
    console.log(error)
    internalerrorlog(error.message);
    throw new Error(error.message)
  }
  rrequest.extendOptions({ prefix: prefix, errorHandler: errorHandler });
}

let urlModifier: FUrlModifier | undefined = undefined;

export async function restapilist(list: string, pars?: Record<string, string>) {
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
