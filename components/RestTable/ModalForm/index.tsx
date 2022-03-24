import React, { useState, useEffect, MutableRefObject, useRef } from 'react';
import { Modal } from 'antd';

import { ModalListProps, TForm, ButtonAction, TRow } from '../typing'
import { Status } from '../typing'
import readdefs, { ReadDefsResult } from "../readdefs";
import InLine from '../../../ts/inline';
import constructButton, { FClickButton } from '../constructbutton';
import ModalFormView, { IRefCall } from './ModalFormView';
import { ismaskClicked } from '../helper'
import { trace } from '../../../ts/l'


type DataFormState = {
    status: Status;
    tabledata?: TForm;
    js?: any
};

const emptyTForm: TForm = {
    fields: [],
    buttons: []
}

function ltrace(mess: string) {
    trace('ModalForm', mess)
}

const ModalForm: React.FC<ModalListProps> = (props) => {

    const buttonclicked = useRef<ButtonAction | undefined>(undefined);

    const [formdef, setState] = useState<DataFormState>({
        status: Status.PENDING,
        tabledata: emptyTForm
    });

    const ref: MutableRefObject<any> = useRef<IRefCall>();

    const fclick: FClickButton = (b: ButtonAction) => {
        ltrace(`Button clicked: ${b.id}`)
        buttonclicked.current = b
        if (b.validate) {
            ltrace('Button with validate props, call form validation')
            const iref: IRefCall = ref.current
            iref.validate()
        }
        else {
            if (props.closeModal) props.closeModal(b);
        }
    }

    function onClose(e: React.MouseEvent<HTMLElement, MouseEvent>): void {
        if (ismaskClicked(e)) return
        if (props.closeModal) props.closeModal()
    }

    function onButtonClicked(r: TRow): void {
        if (props.closeModal) props.closeModal(buttonclicked.current, r)
    }

    useEffect(() => {

        if (props.listdef === undefined) return

        function setS(d: ReadDefsResult) {

            if (d.status === Status.READY)
                setState({
                    status: Status.READY,
                    tabledata: { ...(d.res as TForm) },
                    js: d.js,
                })
            else setState({
                status: Status.ERROR,
            })

        }

        readdefs(props, setS)

    }, [props.listdef]);

    if (formdef.status === Status.PENDING) return null

    const buttons: React.ReactNode | undefined = formdef.tabledata?.buttons ?
        formdef.tabledata.buttons.map(e => constructButton(e, fclick)) :
        undefined

    return <React.Fragment>
        <InLine js={formdef.js} />
        <Modal destroyOnClose visible={props.visible}
            onCancel={onClose} {...props.props} footer={buttons}>
            {formdef.status === Status.READY ?
                <ModalFormView ref={ref} {...(formdef.tabledata as TForm)} buttonClicked={onButtonClicked} /> : undefined}
        </Modal >
    </React.Fragment>
}

export default ModalForm
