import { restapilist } from "../../services/api"
import { JsonTableResult, RestTableParam, RowData } from "../../ts/typing"
import { ColumnList, Status } from "./typing"
import { transformList,addRowKey } from "./tranformlist"
import { fatalexceptionerror } from '../../ts/l'
import defaults from '../../ts/defaults'

export type DataSourceState = JsonTableResult & {
    status: Status;
    rowkey?: string
};

type FSetState = (s: DataSourceState) => void

function readlist(props: RestTableParam & ColumnList, f: FSetState) {

    restapilist(props.list as string, props.params).then((res) => {
        transformList(props.columns, { r: {}, t: res.res, vars: props.vars })
        const rowkey: string = props.rowkey ? props.rowkey : defaults.rowkeyS
        if (props.rowkey === undefined) addRowKey(res.res as RowData,defaults.rowkeyS)
        f({ status: Status.READY, res: res.res, vars: res.vars, rowkey : rowkey })
    }).catch((e) => {
        fatalexceptionerror(`Error while executing ${props.list} ${props.params}`, e)
        f({ status: Status.ERROR, res: [] })
    }
    )
}

export default readlist;