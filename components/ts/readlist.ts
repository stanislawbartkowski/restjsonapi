import { restapilist } from "../../services/api"
import { JsonTableResult, RestTableParam, RowData } from "../../ts/typing"
import { ColumnList, Status } from "./typing"
import { transformList } from "./tranformlist"
import { fatalexceptionerror } from '../../ts/l'

export type DataSourceState = JsonTableResult & {
    status: Status;
};

type FSetState = (s: DataSourceState) => void

function readlist(props: RestTableParam & ColumnList, f: FSetState) {

    restapilist(props.list as string, props.params).then((res) => {
        transformList(props.columns, { r: {}, t: res.res, vars: props.vars })
        f({ status: Status.READY, res: res.res, vars: res.vars })
    }).catch((e) => {
        fatalexceptionerror(`Error while executing ${props.list} ${props.params}`, e)
        f({ status: Status.ERROR, res: [] })
    }
    )
}

export default readlist;