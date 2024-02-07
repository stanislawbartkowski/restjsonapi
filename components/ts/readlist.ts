import { HTTPMETHOD, JsonTableResult, RESTMETH, RowData, TRow } from "../../ts/typing"
import { ColumnList, Status, TAutoComplete, TAutoCompleteMap } from "./typing"
import { transformList, addRowKey } from "./tranformlist"
import { fatalexceptionerror, internalerrorlog } from '../../ts/l'
import defaults from '../../ts/defaults'
import analyzeresponse from "./anayzeresponse"
import { readvals } from "./readdefs"
import { callJSFunction } from "../../ts/j"
import { getRowKey } from "./helper"

export type DataSourceState = JsonTableResult & {
    status: Status;
    rowkey?: string
};

export type TReadListParam = RESTMETH & {
    list?: string
    vars?: TRow

}

type FSetState = (s: DataSourceState) => void

function readlist(props: TReadListParam & ColumnList, f: FSetState) {

    function isGet() {
        return (props.method === undefined && props.jsaction === undefined)
    }

    const initval: string | RESTMETH = isGet() ? (props.list as string) : { ...props as RESTMETH, restaction: props.restaction ? props.restaction : props.list }
    readvals(initval, {}, props.vars, props.params)
        .then((rres) => {
            let lres = rres.res
            let vars = rres.vars
            if (!isGet() && props.method !== HTTPMETHOD.JS) {
                const da = analyzeresponse(rres.data, rres.response)
                lres = da[0].res
                vars = da[0].vars
            }
            transformList(props.columns, { r: {}, t: lres, vars: {...props.vars, ...vars} })
            //const rowkey: string = props.rowkey ? props.rowkey : defaults.rowkeyS
            const rowkey: string = getRowKey(props)
            if (props.rowkey === undefined) addRowKey(lres as RowData, defaults.rowkeyS)
            f({ status: Status.READY, res: lres, vars: vars, rowkey: rowkey })
        }).catch((e) => {
            fatalexceptionerror(`Error while executing ${props.list} ${props.params}`, e)
            f({ status: Status.ERROR, res: [] })
        }
        )
}

async function readAutocompleteasync(autocomplete: TAutoComplete[]): Promise<TAutoCompleteData[]> {
    const autoc: TAutoCompleteData[] = await Promise.all(
        autocomplete.map(async t => {
            let lres = undefined
            if (t.js !== undefined) {
                const rdata = callJSFunction(t.js, { r: {} })
                lres = rdata.res
            }
            else {
                const rres = await readvals(t, {})
                const da = analyzeresponse(rres.data, rres.response)
                lres = da[0].res
            }
            const c: TAutoCompleteData = {
                id: t.id,
                options: lres
            }
            return c
        })
    )
    return autoc
}

type TAutoCompleteData = {
    id: string,
    options: RowData
}

type FSetAutcomplete = (s: TAutoCompleteMap) => void


export function readAutocomplete(autocomplete: TAutoComplete[], setResult: FSetAutcomplete) {

    readAutocompleteasync(autocomplete).then(
        (r: TAutoCompleteData[]) => {
            const result: TAutoCompleteMap = new Map(r.map(i => [i.id, i.options]));
            setResult(result)
        }
    ).catch(
        () => {
            const error = "Error while reading autocomplete data"
            console.log(error)
            internalerrorlog(error)
        }
    )

}

export default readlist;