import { Rule, RuleObject } from "antd/lib/form"

import defaults from "../../../ts/defaults"
import { makeMessage, callJSFunction } from "../../../ts/j"
import lstring from "../../../ts/localize"
import { FIELDTYPE, TRow, RESTMETH, FormMessage, FieldValue, FieldDefaults } from "../../../ts/typing"
import { decomposeEditId, genEditClickedRowKey, isnotdefined, istrue } from "../../ts/helper"
import { fieldType } from "../../ts/transcol"
import { transformSingleValue } from "../../ts/transformres"
import { RestValidatorResult, TField } from "../../ts/typing"
import { IFieldContext, FField } from "./types"
import { findLabel } from "../../../ts/readresource"
import { getFieldProps } from "./helper"


function updateRulesbyLabel(t: FField, rules: Rule[]) {
    if (t.label === undefined) return
    const d: FieldDefaults | undefined = findLabel(t.label)
    if (d === undefined) return
    if (d.len !== undefined) {
        // find len
        if (rules.find(r => (r as RuleObject).len !== undefined) === undefined)
            rules.push({ len: d.len })
    }
    if (d.max !== undefined) {
        // find max
        if (rules.find(r => (r as RuleObject).max !== undefined) === undefined)
            rules.push({ max: d.max })
    }
}

export function createRules(ir: IFieldContext, t: FField): [Rule[] | undefined, boolean] {

    const fieldtype: FIELDTYPE = fieldType(t)

    const rules: Rule[] = []
    let required: boolean = false

    if (fieldtype === FIELDTYPE.MONEY) rules.push({ pattern: new RegExp(/^[+-]?\d*\.?\d*$/), message: lstring("moneypattern") })

    const aprops: TField | undefined = getFieldProps(ir, t) as TField
    const novalidate: boolean = (aprops !== undefined && istrue(aprops.novalidate))

    if (!novalidate && t.validate)
        t.validate.forEach(e => {
            const message: string | undefined = e.message ? makeMessage(e.message) : undefined
            if (e.required) {
                rules.push({ required: true, message: message })
                required = true
            }
            if (e.pattern) {
                rules.push({ pattern: new RegExp(e.pattern), message: message })
            }
            if (e.restaction || e.js) {
                rules.push(
                    ({ getFieldValue }) => ({
                        async validator(f: any, value) {
                            if (isnotdefined(value)) return Promise.resolve();
                            if ((fieldtype === FIELDTYPE.STRING) && value === "") return Promise.resolve();
                            const data: TRow = {}
                            const v: FieldValue = transformSingleValue(value, t, true)
                            data[t.field] = v
                            data[defaults.currentfield] = v
                            const a: Array<string> = f.field.split('.')
                            if (a.length === 3) {
                                const pos: number = +a[1]
                                data[defaults.listpos] = pos
                            }
                            const editpos: [string, string, number] | undefined = decomposeEditId(f.field)
                            if (editpos !== undefined) {
                                const currentrow = genEditClickedRowKey(editpos[0])
                                data[currentrow] = editpos[2]
                            }

                            let dat: TRow = {}
                            if (e.restaction) {
                                const h: RESTMETH = e.restaction as RESTMETH;
                                dat = await ir.aRest(h, data)
                            }
                            else {
                                dat = callJSFunction(e.js as string, { r: { ...ir.getValues(), ...data } });
                            }
                            const res: RestValidatorResult = dat
                            if (res.err === undefined) return Promise.resolve();
                            const errmess: string = makeMessage(res.err as FormMessage) as string
                            return Promise.reject(new Error(errmess))
                        }
                    }

                    ))
            }

        })

    updateRulesbyLabel(t, rules)

    return [rules.length === 0 ? undefined : rules, required]

}