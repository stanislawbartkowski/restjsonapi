import { Modal } from "antd";
import React, { ReactNode, useState } from "react";

import { PropsType, TRow } from "../../ts/typing";
import { ClickActionProps } from "../../ts/typing";
import ModalFormDialog, { ModalHooks } from "./ModalFormDialog";
import TemplateFormDialog from './TemplateFormDialog'

export type ModalFormProps = ClickActionProps &
{
    visible?: boolean
    ispage?: boolean
    vars?: TRow
}

type ModalPropsData = {
    modalprops: PropsType | undefined;
    buttons: ReactNode
}

const ModalDialog: React.FC<ModalFormProps> = (props) => {

    const [moddef, setState] = useState<ModalPropsData>({ modalprops: undefined, buttons: undefined });

    const ihooks: ModalHooks = {

        setButtons: function (buttons: ReactNode): void {
            setState({ ...moddef, buttons: buttons })
        },
        setProps: function (props: PropsType): void {
            setState({ ...moddef, modalprops: props })
        }
    }

    function onClose(e: React.MouseEvent<HTMLElement, MouseEvent>): void {
    }

    if (props.ispage) return <ModalFormDialog {...props} />
    else return <Modal destroyOnClose visible={props.visible}
        onCancel={onClose} {...moddef.modalprops} footer={moddef.buttons} >
        <ModalFormDialog {...props} mhooks={ihooks} />
    </Modal >
}


export default ModalDialog;
