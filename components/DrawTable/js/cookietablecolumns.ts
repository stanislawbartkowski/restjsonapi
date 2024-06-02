import { RestTableParam } from "../../../ts/typing"
import { getCookie, setCookie } from "../../../ts/cookies";
import { cookieNameQualified, verifyColumns } from "./helper";
import { ColumnT, ColumnsT } from "../typing";
import { ColumnList } from "../../ts/typing";

function cookieName(p: RestTableParam): string {
    return cookieNameQualified(p, "table_columns")
}

const removeTitle = (e: ColumnT) => {
    const d = {}
    const dest: ColumnT = Object.assign(d, e)
    dest.title = undefined
    return dest
}

export function saveCookieTableColumns(p: RestTableParam, cols: ColumnsT) {
    const cookiename: string = cookieName(p)
    const reducedCols: ColumnsT = cols.map(e => removeTitle(e))
    const j: string = JSON.stringify(reducedCols);
    setCookie(cookiename, j)
}

export function getCookieTableColumns(r: RestTableParam, p: ColumnList): ColumnsT | undefined {
    const cookiename: string = cookieName(r)
    const j: string | undefined = getCookie(cookiename)
    if (j === undefined) return undefined
    const m: ColumnsT = JSON.parse(j) as ColumnsT
    if (!verifyColumns(p.columns, m.map(c => c.key), cookiename)) return undefined
    return m
}