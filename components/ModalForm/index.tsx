import React, { ReactNode, useRef, useState } from "react";

import { ModalFormProps } from "../../ts/typing";
import { ismaskClicked } from "../ts/helper";
import ModalFormDialog, { ModalHooks } from "./ModalFormDialog";
import DraggableModal from '../DraggableModal'

type ModalPropsData = {
    buttons: ReactNode
}

const ModalDialog: React.FC<ModalFormProps> = (props) => {

    const [moddef, setState] = useState<ModalPropsData>({ buttons: undefined });
    const [modaltitle, setModalTitle] = useState<string|undefined>(undefined)

    const ihooks: ModalHooks = {

        setButtons: function (buttons: ReactNode, loading: boolean): void {
            setState({ ...moddef, buttons: buttons })
        },
        setTitle: function(title: string|undefined): void {
            setModalTitle(title)
        }
    }

    function onClose(e: React.MouseEvent<HTMLElement, MouseEvent>): void {
        if (ismaskClicked(e)) return
        setModalTitle(undefined)
        if (props.closeAction) props.closeAction()
    }


    if (props.ispage) return <ModalFormDialog {...props} />
    return <DraggableModal open={props.visible as boolean} title={modaltitle}
        onClose={onClose} modalprops={props.modalprops} buttons={moddef.buttons}
    >

        <ModalFormDialog {...props} mhooks={ihooks} />
    </DraggableModal >
}


export default ModalDialog;
