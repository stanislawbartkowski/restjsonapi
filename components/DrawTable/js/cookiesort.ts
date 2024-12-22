import { getCookie, setCookie } from "../../../ts/cookies";
import { RestTableParam } from "../../../ts/typing";
import { ColumnSortType, TColumn } from "../../ts/typing";
import { cookieNameQualified } from "./helper";

function cookieName(p: RestTableParam): string {
    return cookieNameQualified(p, "sort_columns")
}

type CookieSort = {
    field: string
    sort: ColumnSortType
}

export function saveCookieSortColumn(p: RestTableParam, c: TColumn, sort: ColumnSortType) {
    const cookiename: string = cookieName(p)

    if (sort === ColumnSortType.NO) {
        setCookie(cookiename, undefined)
        return
    }

    const cookie: CookieSort = {
        field: c.field,
        sort: sort
    }
    const j: string = JSON.stringify(cookie);
    setCookie(cookiename, j)
}

export function getCookieSortColumn(r: RestTableParam, c: TColumn): ColumnSortType {
    const cookiename: string = cookieName(r)
    const j: string | undefined = getCookie(cookiename)
    if (j === undefined) return ColumnSortType.NO
    const m: CookieSort = JSON.parse(j) as CookieSort
    return m.field === c.field ? m.sort : ColumnSortType.NO
}