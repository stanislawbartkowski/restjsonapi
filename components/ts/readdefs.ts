import { PreseForms, TField, TForm, TItemsRest, TPreseEnum, TRadioCheck } from "./typing";
import { log } from "../../ts/l";
import { callJSFunction, commonVars, isOArray, isString, makeMessage } from "../../ts/j";
import type { FieldValue, FormMessage, RESTMETH, RestTableParam, RowData, TRow } from "../../ts/typing";
import { HTTPMETHOD } from "../../ts/typing";
import { restapilistdef, restapijs, restapishowdetils, restapilist, restaction } from "../../services/api";
import { Status, ColumnList, ShowDetails } from "./typing";
import { isItemGroup, isnotdefined, istrue, preseT } from './helper'
import { internalerrorlog } from '../../ts/l'
import analyzeresponse from "./anayzeresponse";
import { TabItems } from "./typing";

export type ReadDefsResult = {
    status: Status
    res?: PreseForms
    js?: any
    initvar?: TRow
}

type FSetState = (res: ReadDefsResult) => void

export async function readvals(initval: string | RESTMETH, vars?: TRow, params?: Record<string, FieldValue>): Promise<Record<string, any>> {
    if (isString(initval)) return await restapilist(initval as string, params)
    const rr: RESTMETH = initval as RESTMETH
    const r: RESTMETH = rr.jsaction ? callJSFunction(rr.jsaction, { r: {}, vars: vars }) as RESTMETH : rr
    return restaction(r.method === undefined ? HTTPMETHOD.GET : r.method, r.restaction as string, r.params, vars)
}


export async function readvalsdata(initval: string | RESTMETH, vars?: TRow, params?: Record<string, FieldValue>): Promise<Record<string, any>> {
    const dat: any = await readvals(initval, vars, params)
    // dat.data === undefinded means GET method only
    if (dat.data === undefined) return Promise.resolve(dat)
    const da = analyzeresponse(dat.data, dat.response)
    return Promise.resolve(da[0])
}


//  restaction(res.method as HTTPMETHOD, res.restaction, res.params, t)

async function resolveRest(tl: TField[]): Promise<TField[]> {
    const ffields: TField[] = await Promise.all(tl.map(async c => {

        const tr: TRadioCheck | undefined = c.checkbox ? c.checkbox : c.radio ? c.radio : undefined
        if (isItemGroup(c)) {
            const itemlist: TField[] = await resolveRest(c.items as TField[])
            c.items = itemlist
            return c;
        }
        if (c.tab) {
            const tabs: TabItems[] = await Promise.all(c.tab.tabs.map(async c => {
                const items: TField[] = await resolveRest(c.items as TField[])
                c.items = items
                return c
            }))
            return c
        }

        const getLabel = (rest: TItemsRest, r: TRow) => {
            const f: FormMessage = rest.label
            if (f === undefined) return r[rest.label as string]
            if (isString(f)) {
                const ff: string = f as string
                return (isnotdefined(r[ff])) ? r[rest.value] : r[rest.value] + " " + r[(ff)]
            }
            return makeMessage(f, { r: r }) as string
        }

        if (tr) {
            const rest: TItemsRest | undefined = !isOArray(tr.items) ? tr.items as TItemsRest : undefined
            if (rest) {
                //const resta: Record<string, any> = await restapilist(rest.restaction)
                const resta: Record<string, any> = await readvalsdata(rest, {}, rest.params)
                const rlist: RowData = resta.res
                tr.items = rlist.map(r => {
                    return {
                        value: r[rest.value] as string,
                        label: { messagedirect: getLabel(rest, r) } as FormMessage
                    }
                })
                if (c.checkbox) c.checkbox = { ...tr }
                if (c.radio) c.radio = { ...tr }
            }
        }
        return c
    }))
    return ffields

}

async function readdefs(props: RestTableParam, f: FSetState, ignoreinitvals?: boolean) {

    const def: string = props.listdef ? props.listdef : props.list as string

    try {
        const idef: PreseForms = await restapilistdef(def) as PreseForms
        const js: string | undefined = (idef.js) ? await restapijs(idef.js) : undefined
        const ic: ColumnList = idef as ColumnList
        let header: ShowDetails | undefined = undefined
        if (ic.header && (ic.header.def || ic.header.js)) {
            header = ic.header.js ? callJSFunction(ic.header.js, { r: {}, vars: props.vars }) : ic.header
            if (header?.def) header = await restapishowdetils(header?.def) as ShowDetails
        }
        if (header) {
            ic.header = { ...header }
        }
        if (preseT(idef) === TPreseEnum.TForm) {
            // look for dynamic items
            const t: TForm = idef as TForm
            const ffields: TField[] = await resolveRest(t.fields)

            const initvals: TRow | undefined = (t.restapivals && !istrue(ignoreinitvals)) ? await readvalsdata(t.restapivals, { ...commonVars(), ...props.vars }) : undefined
            f({ status: Status.READY, js: js, res: { ...idef, fields: ffields }, initvar: initvals });
        }
        else f({ status: Status.READY, js: js, res: idef });
    } catch (error) {
        console.log(error)
        internalerrorlog(`Error while reading definition ${def}`)
        f({ status: Status.ERROR });
    }

}

export default readdefs