import { JsonTableResult, RESTMETH, RowData, TRow } from "../../ts/typing"
import { ColumnList, Status } from "./typing"
import { transformList, addRowKey } from "./tranformlist"
import { fatalexceptionerror } from '../../ts/l'
import defaults from '../../ts/defaults'
import analyzeresponse from "./anayzeresponse"
import { readvals } from "./readdefs"

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
        return props.method === undefined && props.jsaction === undefined
    }

    //(props.method === undefined ?
    //    restapilist(props.list as string, props.params) :
    //    restaction(props.method as HTTPMETHOD, props.list as string, props.params, props.vars))
    const initval: string | RESTMETH = isGet() ? (props.list as string) : { ...props as RESTMETH, restaction: props.restaction ? props.restaction : props.list }
    readvals(initval, props.vars, props.params)
        .then((rres) => {
            let lres = rres.res
            let vars = rres.vars
            if (!isGet()) {
                const da = analyzeresponse(rres.data, rres.response)
                lres = da[0].res
                vars = da[0].vars
            }
            transformList(props.columns, { r: {}, t: lres, vars: props.vars })
            const rowkey: string = props.rowkey ? props.rowkey : defaults.rowkeyS
            if (props.rowkey === undefined) addRowKey(lres as RowData, defaults.rowkeyS)
            f({ status: Status.READY, res: lres, vars: vars, rowkey: rowkey })
        }).catch((e) => {
            fatalexceptionerror(`Error while executing ${props.list} ${props.params}`, e)
            f({ status: Status.ERROR, res: [] })
        }
        )
}

export default readlist;