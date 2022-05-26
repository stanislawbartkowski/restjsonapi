import React from "react";

import {TRow } from "../../ts/typing";
import { ClickActionProps } from "../../ts/typing";
import TemplateFormDialog from './TemplateFormDialog'

export type ModalFormProps = ClickActionProps &
{
    visible?: boolean
    ispage?: boolean
    vars?: TRow
}

const ModalDialog: React.FC<ModalFormProps> = (props) => {

    return <TemplateFormDialog {...props} isform />

}


export default ModalDialog;
