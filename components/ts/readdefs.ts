import type { TForm } from "../DrawTable/typing";
import { log } from "../../ts/l";
import { callJSFunction } from "../../ts/j";
import type { RestTableParam } from "../../ts/typing";
import { restapilistdef, restapijs, restapishowdetils } from "../../services/api";
import { Status, ColumnList, ShowDetails } from "./typing";

export type ReadDefsResult = {
    status: Status
    res?: ColumnList | TForm
    js?: any
}


type FSetState = (res: ReadDefsResult) => void

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

        f({ status: Status.READY, js: js, res: idef });
    } catch (error) {
        f({ status: Status.ERROR, });

    }

}

export default readdefs