// ===============================
// origin
// ===============================

import { getDevServer } from "../services/readconf";
import { getCookie, setCookie } from "./cookies";

function getOrigin(): [string, string, number] {
  return [window.location.hostname, window.location.protocol, +window.location.port]
}

function getOriginURL(): string {
  return window.location.origin;
}

function transformURL(url: string): string {
  return url[url.length - 1] === '/' ? url.slice(0, -1) : url
}


function isDev(): boolean {
  return process.env.NODE_ENV !== 'production'
}

const CPATH: string = "lastoriginpath"

function getPath(): string {
  const lastpa: string | undefined = getCookie(CPATH)
  const pa = window.location.pathname
  if (lastpa !== undefined) {
    const tlastpa: string[] = lastpa.split('/')
    const tpa: string[] = pa.split('/')
    if (tlastpa[1] === tpa[1]) return lastpa
  }
  setCookie(CPATH, pa)
  return pa.slice(0, -1)
}

function getOriginPa(): string {
  const pa: string = getPath()

  return getOriginURL() + pa
}

export async function getConfigURL(): Promise<string> {
  if (isDev()) {
    return getOriginURL()
  }
  //return getOriginHREF()
  //return getOriginURL()
  return getOriginPa()
}


export async function getServerUrl(): Promise<string> {
  const p = window.location.pathname
  console.log("path name=" + p)
  if (isDev()) {
    return getDevServer()
  }
  //return getOriginHREF()
  //const u = getOriginURLPath()
  const u = getOriginPa()
  return u
}
