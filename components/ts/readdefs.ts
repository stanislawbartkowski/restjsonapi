import { PreseForms, TField, TForm, TItemsRest, TPanel, TPanelHeader, TPreseEnum, TRadioCheck } from "./typing";
import { callJSFunction, commonVars, isOArray, isString, isnotdefined, makeMessage } from "../../ts/j";
import type { FieldValue, FormMessage, PropsType, RESTMETH, RestTableParam, RowData, TRow } from "../../ts/typing";
import { HTTPMETHOD } from "../../ts/typing";
import { restapilistdef, restapijs, restapishowdetils, restapilist, restaction } from "../../services/api";
import { Status, ColumnList, ShowDetails } from "./typing";
import { isItemGroup, istrue, preseT } from './helper'
import { internalerrorlog } from '../../ts/l'
import analyzeresponse from "./anayzeresponse";
import { TabItems } from "./typing";
import { removeDuplicates } from "../DrawTable/js/helper";

export type ReadDefsResult = {
    status: Status
    res?: PreseForms
    js?: any
    initvar?: TRow
}

type FSetState = (res: ReadDefsResult) => void

type FReadRest = (fields: TField[]) => void

export async function readvals(initval: string | RESTMETH, row: TRow, vars?: TRow, params?: Record<string, FieldValue>): Promise<Record<string, any>> {
    if (isString(initval)) return await restapilist(initval as string, params)
    const rr: RESTMETH = initval as RESTMETH
    const r: RESTMETH = rr.jsaction ? callJSFunction(rr.jsaction, { r: row, vars: vars }) as RESTMETH : rr
    if (r.method === HTTPMETHOD.JS) {
        const r: RowData = callJSFunction(rr.restaction as string, { r: row, vars: vars })
        return {
            res: r
        }
    }
    //const v = {...row, ...vars}
    // Data: 2023/10/09 -- swap, row content overwrites vars
    const v = { ...vars, ...row }
    // Data: 2023/08/04 - is not working if {...row, ...vars} is used directly as function parameter
    // It is not clear, after recompiling it also works while used as function parameter
    // TODO: requires attention
    return restaction(r.method === undefined ? HTTPMETHOD.GET : r.method, r.restaction as string, r.params, v)
    //return restaction(r.method === undefined ? HTTPMETHOD.GET : r.method, r.restaction as string, r.params, vars)
    // return restaction(r.method === undefined ? HTTPMETHOD.GET : r.method, r.restaction as string, r.params, {...row, ...vars})
}


export async function readvalsdata(initval: string | RESTMETH, row: TRow, vars?: TRow, params?: Record<string, FieldValue>): Promise<Record<string, any>> {
    const dat: any = await readvals(initval, row, vars, params)
    // dat.data === undefinded means GET method only
    if (dat.data === undefined) return Promise.resolve(dat)
    const da = analyzeresponse(dat.data, dat.response)
    return Promise.resolve(da[0])
}

async function resolveRest(tl: TField[], row: TRow, vars: TRow): Promise<TField[]> {
    const ffields: TField[] = await Promise.all(tl.map(async c => {

        const tr: TRadioCheck | undefined = c.checkbox ? c.checkbox : c.radio ? c.radio : undefined
        if (c.dynamiccollapse) {
            const data = await readvalsdata(c.dynamiccollapse, {})
            const headers: TPanelHeader[] = data.res
            c.collapse = headers.map(h => {
                const he: TPanelHeader = { ...h }
                h.key = c.field + "_" + h.key
                const items: TField[] = (c.dynamiccollapse?.items as TField[]).map(i => {
                    const item: TField = { ...i }
                    // changet the item id
                    item.field = h.key + "_" + i.field
                    return item
                })
                const pa: TPanel = {
                    ...he,
                    items: items
                }
                return pa
            }
            )
        }
        if (isItemGroup(c)) {
            const itemlist: TField[] = await resolveRest(c.items as TField[], row, vars)
            c.items = itemlist
            return c;
        }
        if (c.tab) {
            // lint is complaining but it must be executed
            const tabs: TabItems[] = await Promise.all(c.tab.tabs.map(async c => {
                const items: TField[] = await resolveRest(c.items as TField[], row, vars)
                c.items = items
                return c
            }))
            return c
        }
        // Data: 2024/03/09
        if (c.collapse) {
            const panels: TPanel[] = c.collapse
            const ipanels: TPanel[] = await Promise.all(panels.map(
                async pa => {
                    const items: TField[] = await (resolveRest(pa.items as TField[], row, vars))
                    pa.items = items
                    return pa
                }
            ))
            c.collapse = ipanels
            return c
        }

        const getLabel = (rest: TItemsRest, r: TRow) => {
            const f: FormMessage = rest.label
            if (f === undefined) return ""
            if (isString(f)) {
                const ff: string = f as string
                if (isnotdefined(r[ff])) return r[rest.value]
                return (istrue(rest.onlylabel)) ? r[ff] : r[rest.value] + " " + r[(ff)]
            }
            return makeMessage(f, { r: r }) as string
        }

        const getSubLabel = (rest: TItemsRest, r: TRow) => {
            if (rest.sublabel === undefined) return undefined
            const f: FormMessage = rest.sublabel
            if (isString(f)) {
                const ff: string = f as string
                if (isnotdefined(r[ff])) return undefined
                return r[ff]
            }
            return makeMessage(f, { r: r }) as string
        }


        if (tr) {
            const rest: TItemsRest | undefined = !isOArray(tr.items) ? tr.items as TItemsRest : undefined
            if (rest) {
                //const resta: Record<string, any> = await restapilist(rest.restaction)
                const resta: Record<string, any> = await readvalsdata(rest, row, vars, rest.params)
                const rlist: RowData = resta.res
                tr.items = rlist.map(r => {
                    const subLabel = getSubLabel(rest, r)
                    return {
                        value: r[rest.value] as string,
                        label: { messagedirect: getLabel(rest, r) } as FormMessage,
                        sublabel: subLabel === undefined ? undefined : { messagedirect: subLabel } as FormMessage,
                        props: {...r.props as PropsType}
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

async function readdefs(props: RestTableParam, f: FSetState, ignoreinitvals?: boolean, initvars?: TRow) {

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
            ic.header = { ...ic.header, ...header }
            ic.header.def = undefined
        }
        switch (preseT(idef)) {
            case TPreseEnum.TForm:
                // look for dynamic items
                const t: TForm = idef as TForm
                const beforevals: TRow | undefined = (t.beforedialog && !istrue(ignoreinitvals)) ? await readvalsdata(t.beforedialog, {}, { ...commonVars(), ...props.vars }) : undefined
                const vars: TRow = { ...initvars, ...props.vars, ...beforevals }
                const ffields: TField[] = await resolveRest(t.fields, {}, vars)

                const initvals: TRow | undefined = (t.restapivals && !istrue(ignoreinitvals)) ? await readvalsdata(t.restapivals, {}, { ...commonVars(), ...vars }) : undefined
                f({ status: Status.READY, js: js, res: { ...idef, fields: ffields }, initvar: { ...initvals, ...beforevals } });
                break;
            case TPreseEnum.ColumnList:
                ic.columns = removeDuplicates(ic.columns)
                f({ status: Status.READY, js: js, res: ic });
                break;
            case TPreseEnum.Steps:
                f({ status: Status.READY, js: js, res: idef });
                break;
        }
    } catch (error) {
        console.log(error)
        internalerrorlog(`Error while reading definition ${def}`)
        f({ status: Status.ERROR });
    }

}

export async function rereadRest(props: RestTableParam, f: FReadRest, row: TRow) {
    const def: string = props.listdef ? props.listdef : props.list as string
    const idef: PreseForms = await restapilistdef(def) as PreseForms
    // 2023/07/23 - can be a Step
    if (preseT(idef) === TPreseEnum.Steps) return
    const t: TForm = idef as TForm
    const ffields: TField[] = await resolveRest(t.fields, row, props.vars as TRow)
    f(ffields)
}

export default readdefs