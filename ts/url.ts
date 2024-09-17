// ===============================
// origin
// ===============================

import { emptys } from "../components/ts/helper";
import { getDevServer } from "../services/readconf";
import { getCookieND, setCookieND } from "./cookies";
import { log } from "./l";

function getOriginURL(): string {
  return window.location.origin;
}

function isUrlDomain(url: string): boolean {
  return url[url.length - 1] === '/' && url.length > 1
}

function getDomainFromURL(): string {
  const path = window.location.pathname
  const p = path.split("/")
  return p.length > 1 && p[1] !== "" ? "/" + p[1] : ""
}

function isDev(): boolean {
  return process.env.NODE_ENV !== 'production'
}

const CPATH: string = "lastoriginpath"

let domain: string | undefined = undefined

export function setUrlDomain() {
  // decide on origin path
  const lastpa: string | undefined = getCookieND(CPATH)
  domain = getDomainFromURL()
  if (lastpa !== undefined && !isUrlDomain(window.location.pathname)) {
    if (window.location.pathname.startsWith(lastpa)) {
      domain = lastpa
      log("Refresh, found domain in cookie")
    }
  }
  log("Domain: " + (domain === "" ? "(no domain)" : domain))
  setCookieND(CPATH, domain)
}

export function isDomain(): boolean {
  return !emptys(domain)
}

export function getDomain(): string {
  return domain as string
}

export function getRouterRoot() {
  return getDomain() + '/'
}

function getOriginPa(): string {
  const pa: string = getDomain()

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
