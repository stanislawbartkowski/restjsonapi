import { isString } from "antd/es/button";
import { makeMessage } from "../../../ts/j";
import { TCookie, TCookieO, TRadioCheckItem } from "../../ts/typing";
import { ErrorMessages, ErrorMessage, FField, IFieldContext } from "./types";
import { istrue } from "../../ts/helper";

export function itemName(e: TRadioCheckItem): string | undefined {
    return makeMessage(e.label, { r: {} })
}

export function findErrField(field: string, err: ErrorMessages): ErrorMessage | undefined {
    return err.find(e => e.field === field)
}

export function getCookieValue(ir: IFieldContext, t: FField, c?: TCookie): string | undefined {
    if (c === undefined) return undefined
    if (isString(c)) return c as string
    const cc: TCookieO = c as TCookieO
    if (!istrue(cc.cookie)) return undefined
    const val: string | undefined = ir.fReadCookie(t, cc.addf)
    return (val === undefined) ? cc.default : val
}

export function saveCookieValue(ir: IFieldContext, t: FField, c?: TCookie, val?: string) {
    if (c === undefined || isString(c)) return
    const cc: TCookieO = c as TCookieO
    if (!istrue(cc.cookie)) return undefined
    ir.fWriteCookie(t, val, cc.addf)
}

