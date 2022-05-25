import type { TField, TForm, TItemsRest, TRadioCheck, TRadioCheckItem } from "./typing";
import { log } from "../../ts/l";
import { callJSFunction, isOArray, isObject } from "../../ts/j";
import type { RestTableParam, RowData, TRow } from "../../ts/typing";
import { restapilistdef, restapijs, restapishowdetils, restapilist } from "../../services/api";
import { Status, ColumnList, ShowDetails } from "./typing";

export type ReadDefsResult = {
    status: Status
    res?: ColumnList | TForm
    js?: any
}

type FSetState = (res: ReadDefsResult) => void

function isTForm(p: ColumnList | TForm): boolean {
    return (p as TForm).fields !== undefined
}

async function readdefs(props: RestTableParam, f: FSetState) {


    log("RestTableList " + props.list);

    try {
        const idef: ColumnList | TForm = await restapilistdef(props.listdef ? props.listdef : props.list as string) as (ColumnList | TForm)
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

        if (isTForm(idef)) {
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
            f({ status: Status.READY, js: js, res: { ...idef, fields: ffields } });
        }
        else f({ status: Status.READY, js: js, res: idef });
    } catch (error) {
        f({ status: Status.ERROR, });

    }

}

export default readdefs