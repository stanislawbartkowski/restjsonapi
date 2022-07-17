import { Modal } from "antd";
import React, { ReactNode, useEffect, useState } from "react";

import { ModalFormProps, PropsType, TRow } from "../../ts/typing";
import { ClickActionProps } from "../../ts/typing";
import { ismaskClicked } from "../ts/helper";
import ModalFormDialog, { ModalHooks } from "./ModalFormDialog";

type ModalPropsData = {
    buttons: ReactNode
}

const ModalDialog: React.FC<ModalFormProps> = (props) => {

    const [moddef, setState] = useState<ModalPropsData>({ buttons: undefined });

    const ihooks: ModalHooks = {

        setButtons: function (buttons: ReactNode, loading:  boolean): void {
            setState({ ...moddef, buttons: buttons })
        },
    }

    function onClose(e: React.MouseEvent<HTMLElement, MouseEvent>): void {
        if (ismaskClicked(e)) return
        if (props.closeAction) props.closeAction()
    }

    if (props.ispage) return <ModalFormDialog {...props} />
    return <Modal destroyOnClose visible={props.visible}
        onCancel={onClose} {...props.modalprops} footer={moddef.buttons} >
        <ModalFormDialog {...props} mhooks={ihooks} />
    </Modal >
}


export default ModalDialog;
