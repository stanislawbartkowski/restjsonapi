import React, { useState, useEffect, MutableRefObject, useRef, forwardRef, useImperativeHandle, ReactNode } from 'react';
import { Col, Modal, Row } from 'antd';

import type { ModalListProps } from '../ts/typing'
import type { TForm } from '../ts/typing'
import type { ButtonAction } from '../ts/typing'
import { Status } from '../ts/typing'
import readdefs, { ReadDefsResult } from "../ts/readdefs";
import InLine from '../../ts/inline';
import constructButton, { FClickButton } from '../ts/constructbutton';
import ModalFormView, { IRefCall, ErrorMessages, findErrField } from './ModalFormView';
import { ismaskClicked } from '../ts/helper'
import { trace } from '../../ts/l'
import { TRow } from '../../ts/typing'

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


type ModalFormProps = ModalListProps & {
    ispage?: boolean
}

const ModalForm = forwardRef<IIRefCall, ModalFormProps>((props, iref) => {

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
            if (props.closeModal) props.closeModal(b, ref.current.getValues());
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

    const modaldialog: ReactNode = <Modal destroyOnClose visible={props.visible}
        onCancel={onClose} {...props.props} footer={buttons}>
        {formdef.status === Status.READY ?
            <ModalFormView ref={ref} err={formdef.err} {...(formdef.tabledata as TForm)} buttonClicked={onButtonClicked} onValuesChanges={onValuesChange} /> : undefined}
    </Modal >

    const pagedialog: ReactNode = <React.Fragment>
        <Row>
            <Col>
                {formdef.status === Status.READY ?
                    <ModalFormView 
                        ref={ref} err={formdef.err}
                        {...(formdef.tabledata as TForm)}
                        buttonClicked={onButtonClicked}
                        buttonsextra={buttons}
                        onValuesChanges={onValuesChange} /> : undefined}

            </Col>
        </Row>
    </React.Fragment>

    return <React.Fragment>
        <InLine js={formdef.js} />
        {props.ispage ? pagedialog : modaldialog}
    </React.Fragment>
})

export default ModalForm
