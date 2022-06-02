import { PreseForms, TField, TForm, TItemsRest, TPreseEnum, TRadioCheck } from "./typing";
import { log } from "../../ts/l";
import { callJSFunction, isOArray } from "../../ts/j";
import type { RestTableParam, RowData, TRow } from "../../ts/typing";
import { restapilistdef, restapijs, restapishowdetils, restapilist } from "../../services/api";
import { Status, ColumnList, ShowDetails } from "./typing";
import { preseT } from './helper'
import { internalerrorlog } from '../../ts/l'

export type ReadDefsResult = {
    status: Status
    res?: PreseForms
    js?: any
    initvar?: TRow
}

type FSetState = (res: ReadDefsResult) => void

async function readvals(initval: string, vars?: TRow): Promise<TRow> {
    return await restapilist(initval as string)
}

async function readdefs(props: RestTableParam, f: FSetState, ignoreinitvals? : boolean) {

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

            const ffields: TField[] = await Promise.all(t.fields.map(async c => {
                const tr: TRadioCheck | undefined = c.checkbox ? c.checkbox : c.radio ? c.radio : undefined
                if (tr) {
                    const rest: TItemsRest | undefined = !isOArray(tr.items) ? tr.items as TItemsRest : undefined
                    if (rest) {
                        const resta: Record<string, any> = await restapilist(rest.restaction)
                        const rlist: RowData = resta.res
                        tr.items = rlist.map(r => { return { value: r[rest.value] as string, label: { messagedirect: r[rest.label] as string } } })
                        console.log(tr)
                        if (c.checkbox) c.checkbox = { ...tr }
                        if (c.radio) c.radio = { ...tr }
                    }
                }
                return c
            }))
            const initvals: TRow | undefined = (t.restapivals && (ignoreinitvals === undefined || !ignoreinitvals)) ? await readvals(t.restapivals, props.vars) : undefined
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