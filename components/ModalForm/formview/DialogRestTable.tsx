import { Form } from "antd"
import { ReactNode } from "react"

import { callJSFunction } from "../../../ts/j"
import { FieldValue, RestTableParam, SetMAction, TRow } from "../../../ts/typing"
import RestTable from "../../RestTable"
import { FieldRestList } from "../../ts/typing"
import { IFieldContext, FField, TableRefreshData } from "./types"
import defaults from "../../../ts/defaults"

// ===========================
// RestTable as a field
// ===========================


export function produceRestTable(ir: IFieldContext, t: FField): ReactNode {

    const frest: FieldRestList = t.restlist as FieldRestList
    const pars: RestTableParam = frest.js ? callJSFunction(frest.js, { r: ir.getValues() }) as RestTableParam : t.restlist as RestTableParam
    const vars: TRow = ir.getValues()
    const refreshR: TableRefreshData = t.tableR.get(t.field) === undefined ? { refreshno: 0 } : t.tableR.get(t.field) as TableRefreshData

    //const refreshno: number = t.tableR.has(t.field) ? t.tableR.get(t.field) as number : 0
    const setMulti: SetMAction = (sel: FieldValue[]) => {
        ir.setMulti(t, sel);
    }
    //const multiselect: FieldValue[] = ir.getMulti().get(t.field) as FieldValue[]
    // 2023/03/38
    const multiselect: FieldValue[] = vars[t.field] as FieldValue[]
    const pvars = { ...vars, ...pars.vars }
    pvars[defaults.currentfield] = t.field
    return <Form.Item id={t.field} name={t.field} {...t.props} >
        <RestTable {...pars} vars={pvars} refreshno={refreshR.refreshno} setvarsaction={t.setvarsaction} setmulti={setMulti} initsel={multiselect} refreshD={refreshR.searchR} rereadRest={ir.rereadRest} />
    </Form.Item>
}