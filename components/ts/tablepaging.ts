import defaults from "../../ts/defaults";
import { isNumber } from "../../ts/j";
import { PropsType } from "../../ts/typing";
import { PagingC } from "./typing";

function propsPaging(props: PagingC | undefined, dsize: number): PropsType {
    let pageSize: number | undefined = props?.pageSize ? props.pageSize : defaults.defpageSize
    let nopaging: boolean = false;
    if (props?.nopaging) {
        if (isNumber(props.nopaging)) {
            const ps: number = props.nopaging as number
            if (dsize <= ps) nopaging = true
            else pageSize = ps
        }
        else nopaging = true;
    }

    return nopaging ? { pagination: false } : { pagination: { defaultPageSize: pageSize } }
}

export default propsPaging