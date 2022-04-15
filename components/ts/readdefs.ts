import type { TForm } from "../DrawTable/typing";
import { log } from "../../ts/l";
import type { RestTableParam } from "../../ts/typing";
import { restapilistdef, restapijs } from "../../services/api";
import { Status, ColumnList } from "./typing";

export type ReadDefsResult = {
    status: Status
    res?: ColumnList | TForm
    js?: any
}


type FSetState = (res: ReadDefsResult) => void

function readdefs(props: RestTableParam, f: FSetState) {

    let lisstjsready: boolean = false;
    let js: string | undefined = undefined;
    let idef: ColumnList | TForm | undefined = undefined;

    log("RestTableList " + props.list);

    function setstatus() {
        if (lisstjsready && idef !== undefined)
            f({
                status: Status.READY,
                js: js,
                res: idef
            });
    }

    restapilistdef(props.listdef ? props.listdef : props.list as string)
        .then((response: any) => {
            idef = response;
            if ((idef as ColumnList | TForm).js) {
                restapijs((idef as ColumnList | TForm).js as string)
                    .then((jsresponse: any) => {
                        js = jsresponse;
                        lisstjsready = true;
                        setstatus();
                    })
                    .catch(() => {
                        f({
                            status: Status.ERROR
                        });
                    });
            } else {
                lisstjsready = true;
                setstatus();
            }
        })
        .catch(() => {
            f({
                status: Status.ERROR,
            });
        });
}

export default readdefs