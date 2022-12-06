// ==================================
// multichoice button
// ==================================

import { Badge } from "antd"
import { ReactNode } from "react"
import { FieldValue } from "../../../ts/typing"
import { constructButtonElem } from "../../ts/constructbutton"
import { MultiChoiceButton, ButtonAction } from "../../ts/typing"
import { IFieldContext, FField, TMultiSelect } from "./types"

export function produceMultiChoiceButton(ir: IFieldContext, t: FField): ReactNode {

    const s: TMultiSelect = ir.getMulti()
    const se: FieldValue[] | undefined = s.get(t.field)
    const no = se === undefined ? 0 : se.length
    const mu: MultiChoiceButton = t.multichoice as MultiChoiceButton
    const bu = constructButtonElem(mu, (b: ButtonAction) => t.multiF(t))
    if (no === 0) return bu
    return <Badge count={no}>
        {bu}
    </Badge>
}