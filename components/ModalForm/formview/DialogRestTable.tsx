import { Form } from "antd"
import { ReactNode } from "react"

import { callJSFunction } from "../../../ts/j"
import { FieldValue, RestTableParam, SetMAction, TRow } from "../../../ts/typing"
import RestTable from "../../RestTable"
import { FieldRestList } from "../../ts/typing"
import { IFieldContext, FField } from "./types"

// ===========================
// RestTable as a field
// ===========================


export function produceRestTable(ir: IFieldContext, t: FField): ReactNode {

    const frest: FieldRestList = t.restlist as FieldRestList
    const pars: RestTableParam = frest.js ? callJSFunction(frest.js, { r: ir.getValues() }) as RestTableParam : t.restlist as RestTableParam
    const vars: TRow = ir.getValues()
    const refreshno: number = t.tableR.has(t.field) ? t.tableR.get(t.field) as number : 0
    const setMulti: SetMAction = (sel: FieldValue[]) => {
        ir.setMulti(t, sel);
    }
    return <Form.Item id={t.field} name={t.field} {...t.props} >
        <RestTable {...pars} vars={vars} refreshno={refreshno} setvarsaction={t.setvarsaction} setmulti={setMulti} />
    </Form.Item>
}