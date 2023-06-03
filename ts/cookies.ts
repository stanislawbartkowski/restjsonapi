import Cookies from 'js-cookie';
import defaults from './defaults'
import { TRow } from './typing';

//Cookies.set('name', 'value', { expires: 7, path: '' })

let prefix: string | undefined = undefined

const api = Cookies.withAttributes({ expires: defaults.cookieage })

export function setCookiesPrefix(pprefix: string) {
    prefix = pprefix
}

function cookiename(cname: string): string {
    if (prefix === undefined) return cname
    return prefix + "-" + cname
}

export function setCookie(cname: string, value: string | undefined) {
    if (value === undefined) api.remove(cookiename(cname))
    else api.set(cookiename(cname), value)
}

export function getCookie(cname: string): string | undefined {
    const r: string|undefined = api.get(cookiename(cname))
    return r
}

export function setCookieR(cname: string, r: TRow) {
    setCookie(cname, JSON.stringify(r))
}

export function getCookieR(cname: string): TRow | undefined {
    const s: string | undefined = getCookie(cname);
    if (s === undefined) return undefined
    return JSON.parse(s) as TRow
}