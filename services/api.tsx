// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import type { FUrlModifier } from '../ts/typing'

let urlModifier: FUrlModifier | undefined = undefined

export function setUrlModifier(f: FUrlModifier) {
  urlModifier = f;
}

export async function restapilist(list: string) {
  const url: string = '/restapi/' + list;
  const para: any = urlModifier == undefined ? {} : urlModifier(list)
  return request<Record<string, any>>(url, {
    method: 'GET',
    ...{ params: para },
  });
}

export async function restapilistdef(resource: string) {
  return request<Record<string, any>>('/restapi/listdef', {
    method: 'GET',
    ...{ params: { resource: resource } },
  });
}

export async function restapiresource(resource: string) {
  return request<Record<string, any>>('/restapi/resource', {
    method: 'GET',
    ...{ params: { resource: resource } },
  })
}

export async function restapijs(resource: string) {
  return request<Record<string, any>>('/restapi/getjs', {
    method: 'GET',
    ...{ params: { resource: resource } },
  });
}

