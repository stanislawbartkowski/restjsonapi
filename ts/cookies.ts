import Cookies from 'js-cookie';
import defaults from './defaults'
import { TRow } from './typing';
import { getDomain, isDomain } from './url';

//Cookies.set('name', 'value', { expires: 7, path: '' })

let prefix: string | undefined = undefined
let qualifiers: string | undefined = undefined

const api = Cookies.withAttributes({ expires: defaults.cookieage })


export function setCookiesPrefix(pprefix: string) {
    prefix = pprefix
}

export function setCookiesQualifiers(qqualifiers: string) {
    qualifiers = qqualifiers
}

export function combineCookieName(q1: string | undefined, q2: string | undefined): string {

    const q1s: string = q1 === undefined ? "" : q1
    const q2s: string = q2 === undefined ? "" : q2

    return q1s === "" ? q2s === "" ? "" : q2s : q1s + "-" + q2s
}

function cookiename(cname: string, notqualifiy: boolean, nodomain: boolean): string {
    const pnam = prefix !== undefined ? prefix : ""
    const dnam = isDomain() && !nodomain ? combineCookieName(pnam, getDomain()) : pnam
    const qnam = (qualifiers === undefined || notqualifiy) ? dnam : combineCookieName(dnam, qualifiers)

    return combineCookieName(qnam, cname)
}

function setcookie(cname: string, value: string | undefined, notqualifiy: boolean, nodomain: boolean) {
    if (value === undefined) api.remove(cookiename(cname, notqualifiy, nodomain))
    else api.set(cookiename(cname, notqualifiy, nodomain), value)
}


function getcookie(cname: string, notqualifiy: boolean, nodomain: boolean): string | undefined {
    const r: string | undefined = api.get(cookiename(cname, notqualifiy, nodomain))
    return r
}


export function getCookie(cname: string): string | undefined {
    return getcookie(cname, false, false)
}

export function setCookie(cname: string, value: string | undefined) {
    setcookie(cname, value, false, false)
}

export function getCookieNQ(cname: string): string | undefined {
    return getcookie(cname, true, false)
}

export function setCookieNQ(cname: string, value: string | undefined) {
    setcookie(cname, value, true, false)
}

export function getCookieND(cname: string): string | undefined {
    return getcookie(cname, true, true)
}

export function setCookieND(cname: string, value: string | undefined) {
    setcookie(cname, value, true, true)
}


export function setCookieR(cname: string, r: TRow) {
    setCookie(cname, JSON.stringify(r))
}

export function getCookieR(cname: string): TRow | undefined {
    const s: string | undefined = getCookie(cname);
    if (s === undefined) return undefined
    return JSON.parse(s) as TRow
}