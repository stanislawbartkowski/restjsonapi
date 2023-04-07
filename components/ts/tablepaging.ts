import { PaginationProps } from "antd";
import defaults from "../../ts/defaults";
import { isNumber } from "../../ts/j";
import { PropsType } from "../../ts/typing";
import { PagingC } from "./typing";

type TablePagination = {
    pagination : false | PaginationProps
}

export type OnPageChange = (page: number, pageSize: number ) => void

function propsPaging(props: PagingC | undefined, dsize: number, onChange?: OnPageChange, current?: number): [TablePagination, number|undefined] {
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

    return nopaging ? [{ pagination: false }, undefined] : [{ pagination: { defaultPageSize: pageSize, onChange : onChange, current: current } }, pageSize]
}

export default propsPaging