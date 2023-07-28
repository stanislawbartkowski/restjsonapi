import { getCookie, setCookie } from "../../../ts/cookies";
import { RestTableParam } from "../../../ts/typing";
import { TColumn } from "../../ts/typing";
import { cookieNameQualified } from "./helper";

function cookieName(p: RestTableParam, c: TColumn): string {
    return cookieNameQualified(p, c.field + " filter_columns")
}

export function saveCookieFilterColumn(p: RestTableParam, c: TColumn, val: string | undefined) {
    const cookiename: string = cookieName(p, c)

    setCookie(cookiename, val)
}

export function getCookieFielterColumn(p: RestTableParam, c: TColumn): string | undefined {
    const cookiename: string = cookieName(p, c)
    return getCookie(cookiename)
}
