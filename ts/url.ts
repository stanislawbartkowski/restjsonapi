// ===============================
// origin
// ===============================

import { getDevServer } from "../services/readconf";
import { getCookie, setCookie } from "./cookies";

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

let originpath: string | undefined = undefined

function getPath(): string {
  if (originpath === undefined) {
    // decide on origin path
    const lastpa: string | undefined = getCookie(CPATH)
    originpath = transformURL(window.location.pathname)
    if (lastpa !== undefined) {
      if (originpath.startsWith(lastpa)) originpath = lastpa
    }
    setCookie(CPATH, originpath)
  }
  return originpath
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
