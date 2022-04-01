import { restapilist } from "../../../services/api"
import { RestTableParam } from "../../../ts/typing"
import { ColumnList, RowData, Status, TColumn } from "../typing"
import { transformList } from "./helper"
import { isCard } from './helper'
import { fatalexceptionerror } from '../../../ts/l'

export type DataSourceState = {
    status: Status;
    tabledata: RowData;
};


type FSetState = (s: DataSourceState) => void

function readlist(props: RestTableParam & ColumnList, f: FSetState) {

    restapilist(props.list as string, props.params).then((res) => {
        transformList(res.res, isCard(props) ? props.cards as TColumn[] : props.columns as TColumn[])
        f({ status: Status.READY, tabledata: res.res })
    }).catch((e) => {
        fatalexceptionerror(`Error while executing ${props.list} ${props.params}`, e)
        f({ status: Status.ERROR, tabledata: [] })
    }
    )
}

export default readlist;