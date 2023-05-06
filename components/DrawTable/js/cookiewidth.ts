import { getCookie, setCookie } from "../../../ts/cookies";
import defaults from "../../../ts/defaults";
import { getAppData } from "../../../ts/readresource";
import { AppData, FIELDTYPE, RestTableParam, TResize } from "../../../ts/typing";
import { isfalse, istrue, visibleColumns } from "../../ts/helper";
import { fieldType } from "../../ts/transcol";
import { ColumnList, TColumn, TColumns } from "../../ts/typing";
import { ColWidth } from "./helper";

export function isResize(resize?: TResize): boolean {
    const a: AppData | undefined = getAppData()

    if (istrue(resize?.resize)) return true
    if (isfalse(resize?.resize)) return false
    return istrue(a.resize?.resize)
}

function defaultW(c: TColumn, resize?: TResize): number | string | undefined {
    if (! isResize(resize)) return c.width
    const a: AppData | undefined = getAppData()
    const re : TResize = {...a.resize as TResize, ...resize as TResize}
    if (c.width !== undefined) return c.width
    const fieldtype: FIELDTYPE = fieldType(c)
    var w: number = defaults.sizedefault;
    switch (fieldtype) {
        case FIELDTYPE.NUMBER:
            w = re.defaultnumber ? re.defaultnumber : defaults.sizenumber
            break;
        case FIELDTYPE.MONEY:
            w = re.defaultmoney ? re.defaultmoney : defaults.sizemoney
            break;
        case FIELDTYPE.BOOLEAN:
            w = re.defaultboolean ? re.defaultboolean : defaults.sizeboolean
            break;
        case FIELDTYPE.DATE:
            w = re.defaultdate ? re.defaultdate : defaults.sizedate
            break;
    }
    return w
}

function cookieName(p: RestTableParam): string {
    const n: string = (p.list as string) + "_" + (p.listdef !== undefined ? p.listdef : "list")
    return n + "_columns_width"
}

export function saveCookieColWidth(p: RestTableParam, w: ColWidth) {
    const cookiename: string = cookieName(p)
    const j: string = JSON.stringify(Array.from(w.entries()));
    setCookie(cookiename, j)
}

function getCookieColWidth(p: RestTableParam): ColWidth | undefined {
    const cookiename: string = cookieName(p)
    const j: string | undefined = getCookie(cookiename)
    if (j === undefined) return undefined
    const m = new Map(JSON.parse(j));
    return m as ColWidth
}

export function createInitColsWidth(r: RestTableParam, p: ColumnList): ColWidth {
    const clist: TColumns = visibleColumns(p.columns);
    const m: ColWidth = new Map<string, number>()
    const cm: ColWidth | undefined = getCookieColWidth(r)
    clist.forEach(c => {
        const w = cm?.get(c.field) ? cm.get(c.field) : defaultW(c, p.resize)
        if (w !== undefined) m.set(c.field, w)
    }
    )
    return m
}
