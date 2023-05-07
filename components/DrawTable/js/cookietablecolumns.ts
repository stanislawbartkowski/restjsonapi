import { RestTableParam } from "../../../ts/typing"
import { getCookie, setCookie } from "../../../ts/cookies";
import { cookieNameQualified, verifyColumns } from "./helper";
import { ColumnsT } from "../typing";
import { ColumnList } from "../../ts/typing";

function cookieName(p: RestTableParam): string {
    return cookieNameQualified(p, "table_columns")
}

export function saveCookieTableColumns(p: RestTableParam, cols: ColumnsT) {
    const cookiename: string = cookieName(p)
    const j: string = JSON.stringify(cols);
    setCookie(cookiename, j)
}

export function getCookieTableColumns(r: RestTableParam, p: ColumnList): ColumnsT | undefined {
    const cookiename: string = cookieName(r)
    const j: string | undefined = getCookie(cookiename)
    if (j === undefined) return undefined
    const m : ColumnsT = JSON.parse(j) as ColumnsT
    if (!verifyColumns(p, m.map(c => c.key))) return undefined
    return m
}