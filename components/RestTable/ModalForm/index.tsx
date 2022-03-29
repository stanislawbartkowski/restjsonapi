import React, { useState, useEffect, MutableRefObject, useRef, forwardRef, useImperativeHandle } from 'react';
import { Modal}  from 'antd';

import { ModalListProps, TForm, ButtonAction, TRow } from '../typing'
import { Status } from '../typing'
import readdefs, { ReadDefsResult } from "../js//readdefs";
import InLine from '../../../ts/inline';
import constructButton, { FClickButton } from '../js/constructbutton';
import ModalFormView, { IRefCall, ErrorMessages, findErrField } from './ModalFormView';
import { ismaskClicked } from '../js/helper'
import { trace } from '../../../ts/l'
export type { ErrorMessage, ErrorMessages } from './ModalFormView';


export interface IIRefCall {
    setErrorMessage: (errors: ErrorMessages) => void
    setLoadingMode: (loading: boolean) => void
}

type DataFormState = {
    status: Status;
    tabledata?: TForm;
    js?: any,
    err: ErrorMessages
    loading?: boolean
};

const emptyTForm: TForm = {
    fields: [],
    buttons: []
}

function ltrace(mess: string) {
    trace('ModalForm', mess)
}

const ModalForm = forwardRef<IIRefCall, ModalListProps>((props, iref) => {

    const buttonclicked = useRef<ButtonAction | undefined>(undefined);

    const [formdef, setState] = useState<DataFormState>({
        status: Status.PENDING,
        tabledata: emptyTForm,
        err: []
    });

    useImperativeHandle(iref, () => ({
        setErrorMessage: (errors: ErrorMessages) => {
            setState({ ...formdef, err: errors })
        },
        setLoadingMode(loading: boolean) {
            setState({ ...formdef, loading: loading })
        }
    })
    )

    const ref: MutableRefObject<IRefCall> = useRef<IRefCall>() as MutableRefObject<IRefCall>

    const fclick: FClickButton = (b: ButtonAction) => {
        ltrace(`Button clicked: ${b.id}`)
        buttonclicked.current = b
        if (b.validate) {
            ltrace('Button with validate props, call form validation')
            const iref: IRefCall = ref.current
            iref.validate()
        }
        else {
            if (props.closeModal) props.closeModal(b,ref.current.getValues());
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
                    err: []
                });

            else setState({
                status: Status.ERROR, err: []
            })

        }

        readdefs(props, setS)

    }, [props.listdef]);

    if (formdef.status === Status.PENDING) return null

    function onValuesChange(changedFields: Record<string, any>, _: any) {

        if (formdef.err.length === 0) return;
        const remove: Set<string> = new Set<string>()
        for (const e of Object.keys(changedFields))
            if (findErrField(e, formdef.err)) remove.add(e)

        if (remove.size === 0) return
        const err: ErrorMessages = formdef.err.filter(e => !remove.has(e.field))
        setState({ ...formdef, err: err })
    }

    const buttons: React.ReactNode | undefined = formdef.tabledata?.buttons ?
        formdef.tabledata.buttons.map(e => constructButton(e, fclick, formdef.loading, formdef.loading && e.id === buttonclicked.current?.id)) :
        undefined

    return <React.Fragment>
        <InLine js={formdef.js} />
        <Modal destroyOnClose visible={props.visible}
            onCancel={onClose} {...props.props} footer={buttons}>
            {formdef.status === Status.READY ?
                <ModalFormView formprops={props.formprops} ref={ref}  err={formdef.err} {...(formdef.tabledata as TForm)} buttonClicked={onButtonClicked} onValuesChanges={onValuesChange} /> : undefined}
        </Modal >
    </React.Fragment>
})

export default ModalForm
