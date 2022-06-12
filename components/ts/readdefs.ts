import { PreseForms, TField, TForm, TItemsRest, TPreseEnum, TRadioCheck } from "./typing";
import { log } from "../../ts/l";
import { callJSFunction, isOArray, isString } from "../../ts/j";
import type { FormMessage, HTTPMETHOD, RESTMETH, RestTableParam, RowData, TRow } from "../../ts/typing";
import { restapilistdef, restapijs, restapishowdetils, restapilist, restaction } from "../../services/api";
import { Status, ColumnList, ShowDetails } from "./typing";
import { isItemGroup, preseT } from './helper'
import { internalerrorlog } from '../../ts/l'
import analyzeresponse from "./anayzeresponse";

export type ReadDefsResult = {
    status: Status
    res?: PreseForms
    js?: any
    initvar?: TRow
}

type FSetState = (res: ReadDefsResult) => void

async function readvals(initval: string | RESTMETH, vars?: TRow): Promise<Record<string, any>> {
    if (isString(initval)) return await restapilist(initval as string)
    const r: RESTMETH = initval as RESTMETH
    return restaction(r.method as HTTPMETHOD, r.restaction as string, r.params, vars)
}


export async function readvalsdata(initval: string | RESTMETH, vars?: TRow): Promise<Record<string, any>> {
    const dat: any = await readvals(initval, vars)
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

        if (tr) {
            const rest: TItemsRest | undefined = !isOArray(tr.items) ? tr.items as TItemsRest : undefined
            if (rest) {
                const resta: Record<string, any> = await restapilist(rest.restaction)
                const rlist: RowData = resta.res
                tr.items = rlist.map(r => { return { value: r[rest.value] as string, label: { messagedirect: r[rest.label] } as FormMessage } })
                console.log(tr)
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
    log(`Reading definition ${def}`)

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

            const initvals: TRow | undefined = (t.restapivals && (ignoreinitvals === undefined || !ignoreinitvals)) ? await readvalsdata(t.restapivals, props.vars) : undefined
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