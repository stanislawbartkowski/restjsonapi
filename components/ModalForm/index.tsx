import React, { MutableRefObject, useRef, useState } from "react";
import { IIRefCall } from "./ModalFormDialog";
import ModalFormDialog from "./ModalFormDialog";


import executeAction from '../ts/executeaction'
import { ButtonAction, Status, TClickButton } from "../ts/typing";
import { FAction, TComponentProps, TRow } from "../../ts/typing";
import { ClickActionProps } from "../../ts/typing";
import RestComponent from "../RestComponent";

export type ModalFormProps = ClickActionProps &
{
    visible?: boolean
    ispage?: boolean
    vars?: TRow
}

type PopDialogView = {
    def?: TComponentProps
    visible: boolean
}

const ModalDialog: React.FC<ModalFormProps> = (props) => {

    const [restview, setRestView] = useState<PopDialogView>({ visible: false });


    const ref: MutableRefObject<any> = useRef<IIRefCall>();

    const closeF: FAction = () => {
        setRestView({ visible: false })
    }

    const clickButton: TClickButton = (button?: ButtonAction, row?: TRow) => {
        const res: TComponentProps | undefined = executeAction({ ...props, i: ref.current }, button, row);
        if (res) {
            setRestView({ visible: true, def: { ...res, visible: true, closeAction: closeF } })
        }
    }

    const popDialog: React.ReactNode = restview.visible ? <RestComponent {...restview.def} /> : undefined


    return <React.Fragment>
        <ModalFormDialog ref={ref} {...props} clickButton={clickButton} />
        {popDialog}
    </React.Fragment>
}

export default ModalDialog;
