import React, { ReactNode, useEffect, useState } from "react";

import { ModalFormProps, PropsType } from "../../ts/typing";
import { ismaskClicked } from "../ts/helper";
import ModalFormDialog, { ModalHooks } from "./ModalFormDialog";
import DraggableModal from '../DraggableModal'
import { log } from "../../ts/l";

type ModalPropsData = {
    buttons: ReactNode
}

const ModalDialog: React.FC<ModalFormProps> = (props) => {

    const [moddef, setState] = useState<ModalPropsData>({ buttons: undefined });
    const [modaltitle, setModalTitle] = useState<string | undefined>(undefined)
    const [modalprops, setModalProps] = useState<PropsType|undefined>(undefined)

    const ihooks: ModalHooks = {
        setButtons: function (buttons: ReactNode, loading: boolean): void {
            setState({ ...moddef, buttons: buttons });
        },
        setTitle: function (title: string | undefined): void {
            setModalTitle(title);
        },
        rereadRest: function (): void {
            if (props.rereadRest !== undefined) props.rereadRest()
        },
        setModalProps: function (props: PropsType): void {
            // 2024/04/15
            //const mprops = { ...props, ...modalprops }
            const mprops = { ...modalprops, ...props }
            setModalProps(mprops)
        }

    }

    useEffect(() => {

        if (props.modalprops !== undefined)
            setModalProps(props.modalprops)

    }, [props.modalprops]);

    function onClose(e: React.MouseEvent<HTMLElement, MouseEvent>): void {
        if (ismaskClicked(e)) return
        setModalTitle(undefined)
        if (props.closeAction) props.closeAction()
    }


    if (props.ispage) return <ModalFormDialog {...props} />
    return <DraggableModal open={props.visible as boolean} title={modaltitle}
        onClose={onClose} modalprops={modalprops} buttons={moddef.buttons}
    >

        <ModalFormDialog {...props} mhooks={ihooks} />
    </DraggableModal >
}


export default ModalDialog;
