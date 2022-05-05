import React, { MutableRefObject, useRef } from "react";
import { IIRefCall } from "./ModalFormDialog";
import ModalFormDialog from "./ModalFormDialog";


import executeAction from '../ts/executeaction'
import { ButtonAction, TClickButton } from "../ts/typing";
import { TRow } from "../../ts/typing";
import { ClickActionProps } from "../../ts/typing";

export type ModalFormProps = ClickActionProps &
{
    visible?: boolean
    ispage?: boolean
    vars?: TRow
}

const ModalDialog: React.FC<ModalFormProps> = (props) => {

    const ref: MutableRefObject<any> = useRef<IIRefCall>();

    const clickButton : TClickButton = (button?: ButtonAction, row?: TRow) => {
        executeAction({...props, i: ref.current},button,row);
    }
    
    return <ModalFormDialog ref={ref} {...props} clickButton={clickButton} />
}

export default ModalDialog;
