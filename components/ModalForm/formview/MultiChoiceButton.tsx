// ==================================
// multichoice button
// ==================================

import React from "react"
import { Badge, theme } from "antd"
import { ReactNode } from "react"

import { FieldValue } from "../../../ts/typing"
import { constructButtonElem } from "../../ts/constructbutton"
import { ButtonAction, MultiChoiceButton } from "../../ts/typing"
import { IFieldContext, FField, TMultiSelect, ErrorMessages, ErrorMessage } from "./types"
import { findErrField } from "./helper"

interface IMultiChoiceButton {
    ir: IFieldContext
    t: FField,
    err: ErrorMessages
}

const FMultiChoiceButton: React.FC<IMultiChoiceButton> = ({ ir, t, err }) => {
    const { useToken } = theme;
    const { token } = useToken();
    const s: TMultiSelect = ir.getMulti()
    const se: FieldValue[] | undefined = s.get(t.field)
    const no = se === undefined ? 0 : se.length
    const mu: MultiChoiceButton = t.multichoice as MultiChoiceButton
    const r: ErrorMessage | undefined = findErrField(t.field, err)
    const errMess = (r === undefined) ? undefined : r.message
    const bu = constructButtonElem(mu, (b: ButtonAction) => t.multiF(t))
    const multiChoice = (no === 0) ? bu : <Badge count={no} overflowCount={99999}>
        {bu}
    </Badge>
    if (errMess === undefined) return <React.Fragment>{multiChoice}</React.Fragment>
    const errElement = <div style={{ color: token.colorErrorText }}>{errMess}</div>
    return <React.Fragment>
        {multiChoice} {errElement}
    </React.Fragment>
}

function produceMultiChoiceButton(ir: IFieldContext, t: FField, err: ErrorMessages): ReactNode {
    return <FMultiChoiceButton ir={ir} t={t} err={err}></FMultiChoiceButton>
}

export default produceMultiChoiceButton