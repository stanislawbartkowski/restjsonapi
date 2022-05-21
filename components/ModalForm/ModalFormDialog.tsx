import React, { useState, useEffect, MutableRefObject, useRef, forwardRef, useImperativeHandle, ReactNode } from 'react';
import { Card, Col, Modal, Row } from 'antd';

import type { TClickButton, TField } from '../ts/typing'
import type { TForm } from '../ts/typing'
import type { ButtonAction } from '../ts/typing'
import { Status } from '../ts/typing'
import readdefs, { ReadDefsResult } from "../ts/readdefs";
import InLine from '../../ts/inline';
import constructButton, { FClickButton } from '../ts/constructbutton';
import ModalFormView, { IRefCall, ErrorMessages, findErrField } from './ModalFormView';
import { FFieldElem, flattenTForm, ismaskClicked, okmoney, cardProps, setCookiesFormListDefVars, getCookiesFormListDefVars } from '../ts/helper'
import { trace } from '../../ts/l'
import { FIELDTYPE, PropsType, TRow } from '../../ts/typing'
import { fieldType } from '../ts/transcol';
import lstring from '../../ts/localize';
import { transformValuesTo } from '../ts/transformres';

export type { ErrorMessage, ErrorMessages } from './ModalFormView';


export interface IIRefCall {
    setMode: (loading: boolean, errors: ErrorMessages) => void
}


type DataFormState = {
    status: Status;
    tabledata?: TForm;
    js?: any,
    err: ErrorMessages
    loading?: boolean
    initvals?: TRow
};

const emptyTForm: TForm = {
    fields: [],
    buttons: []
}

function ltrace(mess: string) {
    trace('ModalForm', mess)
}

export type ModalFormProps = {
    ispage?: boolean
    clickButton: TClickButton
    listdef?: string
    props?: PropsType
    visible?: boolean
    initvals?: TRow
}


function isCookiesButton(b: ButtonAction): boolean {
    return b.print !== undefined && b.print
}

function setVarsCookies(p: ModalFormProps, b: ButtonAction, r: TRow) {
    if (isCookiesButton(b)) {
        setCookiesFormListDefVars(p.listdef as string, r);
    }
}

function isModalFormCookies(p: TForm): boolean {
    const b: ButtonAction | undefined = p.buttons.find(b => isCookiesButton(b))
    return b !== undefined
}

const ModalFormDialog = forwardRef<IIRefCall, ModalFormProps>((props, iref) => {

    const buttonclicked = useRef<ButtonAction | undefined>(undefined);

    const [formdef, setState] = useState<DataFormState>({
        status: Status.PENDING,
        tabledata: emptyTForm,
        err: []
    });

    useImperativeHandle(iref, () => ({
        setMode: (loading: boolean, errors: ErrorMessages) => {
            setState({ ...formdef, err: errors, loading: loading })
        },
    })
    )

    const ref: MutableRefObject<IRefCall> = useRef<IRefCall>() as MutableRefObject<IRefCall>

    const fields: FFieldElem[] = flattenTForm(formdef.tabledata?.fields as TField[])


    function formvalidate(r: TRow): boolean {
        let ok: boolean = true
        fields.forEach((t: TField) => {
            const fieldtype: FIELDTYPE = fieldType(t)
            if (fieldtype === FIELDTYPE.MONEY && r[t.field] !== undefined) {
                // verify money
                if (!okmoney(r[t.field] as string)) {
                    const err: ErrorMessages = []
                    err.push({ field: t.field, message: lstring("moneypattern") })
                    setState({ ...formdef, err: err, loading: false })
                    ok = false;
                }
            }
        })
        return ok;
    }


    const fclick: FClickButton = (b: ButtonAction) => {
        ltrace(`Button clicked: ${b.id}`)
        buttonclicked.current = b
        const v: TRow = ref.current.getValues()
        if (b.validate) {
            ltrace('Button with validate props, call form validation')
            if (!formvalidate(v)) return;
            const iref: IRefCall = ref.current
            iref.validate()
        }
        else {
            props.clickButton(b, v);
        }
        setVarsCookies(props, b, v);
    }

    function onClose(e: React.MouseEvent<HTMLElement, MouseEvent>): void {
        if (ismaskClicked(e)) return
        props.clickButton()
    }

    function onButtonClicked(r: TRow): void {
        props.clickButton(buttonclicked.current, r)
    }

    useEffect(() => {

        if (props.listdef === undefined) return

        function setS(d: ReadDefsResult) {

            const tabledata: TForm = { ...(d.res as TForm) }
            const vars: TRow | undefined = isModalFormCookies(tabledata) ? getCookiesFormListDefVars(props.listdef as string) : props.initvals
            if (d.status === Status.READY) {
                setState({
                    status: Status.READY,
                    tabledata: tabledata,
                    js: d.js,
                    err: [],
                    initvals: vars ? transformValuesTo(vars, tabledata.fields) : undefined
                });
            }

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

    const formd: TForm = (formdef.tabledata as TForm)

    // requires attention
    //const initvals: TRow | undefined = isModalFormCookies(formd) ? getCookiesFormListDefVars(props.listdef as string) : props.vars

    const modalFormView: ReactNode = formdef.status === Status.READY ?
        <ModalFormView
            ref={ref} err={formdef.err}
            {...formd}
            buttonClicked={onButtonClicked}
            buttonsextrabottom={props.ispage ? buttons : undefined}
            onValuesChanges={onValuesChange} initvals={formdef.initvals}
            list={fields}
        />
        : undefined

    const modaldialog: ReactNode = <Modal destroyOnClose visible={props.visible}
        onCancel={onClose} {...props.props} footer={buttons}>
        {modalFormView}
    </Modal >

    const pagedialog: ReactNode = <React.Fragment>
        <Card {...cardProps(formdef.tabledata)} >
            {modalFormView}
        </Card>
    </React.Fragment>

    return <React.Fragment>
        <InLine js={formdef.js} />
        {props.ispage ? pagedialog : modaldialog}
    </React.Fragment>
})

export default ModalFormDialog
