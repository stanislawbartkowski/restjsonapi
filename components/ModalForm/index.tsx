import React from "react";

import {TRow } from "../../ts/typing";
import { ClickActionProps } from "../../ts/typing";
import ModalFormDialog from "./ModalFormDialog";
import TemplateFormDialog from './TemplateFormDialog'

export type ModalFormProps = ClickActionProps &
{
    visible?: boolean
    ispage?: boolean
    vars?: TRow
}

const ModalDialog: React.FC<ModalFormProps> = (props) => {

    return <ModalFormDialog {...props} />
       
}


export default ModalDialog;
