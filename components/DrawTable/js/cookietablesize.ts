import { SizeType } from "antd/es/config-provider/SizeContext";

import { RestTableParam } from "../../../ts/typing"
import { getCookie, setCookie } from "../../../ts/cookies";

function cookieName(p: RestTableParam): string {
    const n: string = (p.list as string) + "_" + (p.listdef !== undefined ? p.listdef : "table_size")
    return n + "_table_size"
}

export function saveCookieTableSize(p: RestTableParam, s: SizeType) {
    const cookiename: string = cookieName(p)
    const j: string = s as string;
    setCookie(cookiename, j)
}

export function getCookieTableSize(p: RestTableParam): SizeType {
    const cookiename: string = cookieName(p)
    const j: string | undefined = getCookie(cookiename)
    if (j === undefined) return "small"
    return j as SizeType
}
