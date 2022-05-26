import React, { useState, useEffect, MutableRefObject, useRef, forwardRef, useImperativeHandle, ReactNode } from 'react';
import { Card, Modal } from 'antd';

import { ClickResult, PreseForms, StepsForm, TClickButton, TField, TPreseEnum } from '../ts/typing'
import type { TForm } from '../ts/typing'
import type { ButtonAction } from '../ts/typing'
import { Status } from '../ts/typing'
import readdefs, { ReadDefsResult } from "../ts/readdefs";
import InLine from '../../ts/inline';
import constructButton, { FClickButton } from '../ts/constructbutton';
import ModalFormView, { IRefCall, ErrorMessages, findErrField } from './ModalFormView';
import { FFieldElem, flattenTForm, ismaskClicked, okmoney, cardProps, setCookiesFormListDefVars, getCookiesFormListDefVars, preseT } from '../ts/helper'
import { logG, trace } from '../../ts/l'
import { FIELDTYPE, PropsType, TRow } from '../../ts/typing'
import { fieldType } from '../ts/transcol';
import lstring from '../../ts/localize';
import { transformValuesTo } from '../ts/transformres';
import ReadDefError from '../errors/ReadDefError';
import TemplateFormDialog from './TemplateFormDialog'


export type { ErrorMessage, ErrorMessages } from './ModalFormView';


export interface IIRefCall {
    setMode: (loading: boolean, errors: ErrorMessages) => void,
    doAction?: (b: ClickResult) => void
    getVals(): TRow | undefined
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
    return (b.print !== undefined && b.print) || (b.cookie !== undefined && b.cookie)
}

function setVarsCookies(p: ModalFormProps, b: ButtonAction, r: TRow) {
    if (isCookiesButton(b)) {
        setCookiesFormListDefVars(p.listdef as string, r);
    }
}

function isModalFormCookies(p: TForm): boolean {
    if (p.buttons === undefined) return false
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

    const [buttontrigger, setButtonTrigger] = useState<ButtonAction | undefined>()

    useImperativeHandle(iref, () => ({
        setMode: (loading: boolean, errors: ErrorMessages) => {
            setState({ ...formdef, err: errors, loading: loading })
        },
        getVals: () => {
            return ref.current.getValues()
        }
    })
    )

    const ref: MutableRefObject<IRefCall> = useRef<IRefCall>() as MutableRefObject<IRefCall>

    const fields: FFieldElem[] = preseT(formdef.tabledata as PreseForms) === TPreseEnum.TForm ? flattenTForm(formdef.tabledata?.fields as TField[]) : []


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

            if (d.status === Status.READY) {
                const tabledata: TForm = { ...(d.res as TForm) }

                const vars: TRow | undefined = d.initvar !== undefined ? d.initvar : isModalFormCookies(tabledata) ? getCookiesFormListDefVars(props.listdef as string) : props.initvals
                const tranformvals: TRow | undefined = preseT(tabledata) === TPreseEnum.TForm && vars ? transformValuesTo(vars, tabledata.fields) : undefined
                setState({
                    status: Status.READY,
                    tabledata: tabledata,
                    js: d.js,
                    err: [],
                    initvals: tranformvals
                });
            }
            else {
                logG.error(`Error while reading definition`)
                setState({
                    status: Status.ERROR, err: []
                })
            }

        }

        readdefs(props, setS)

    }, [props.listdef]);

    if (formdef.status === Status.PENDING) return null
    if (formdef.status === Status.ERROR) return <ReadDefError />

    if (buttontrigger) {
        fclick(buttontrigger)
    }

    function onValuesChange(changedFields: Record<string, any>, _: any) {

        if (formdef.err.length === 0) return;
        const remove: Set<string> = new Set<string>()
        for (const e of Object.keys(changedFields))
            if (findErrField(e, formdef.err)) remove.add(e)

        if (remove.size === 0) return
        const err: ErrorMessages = formdef.err.filter(e => !remove.has(e.field))
        setState({ ...formdef, err: err })
    }

    const loading: boolean = (formdef.loading !== undefined && formdef.loading)

    const buttons: React.ReactNode | undefined = formdef.tabledata?.buttons ?
        formdef.tabledata.buttons.map(e => constructButton(e, fclick, loading, loading && e.id === buttonclicked.current?.id)) :
        undefined

    const formd: TForm = (formdef.tabledata as TForm)

    // requires attention
    //const initvals: TRow | undefined = isModalFormCookies(formd) ? getCookiesFormListDefVars(props.listdef as string) : props.vars

    const ftype: TPreseEnum | undefined = formdef.status === Status.READY ? preseT(formd) : undefined

    if (ftype === TPreseEnum.TForm && buttontrigger === undefined) {
        const tr: ButtonAction | undefined = formd.buttons ? formd.buttons.find(e => e.trigger) : undefined
        if (tr) setButtonTrigger(tr)
    }

    const modalFormView: ReactNode = formdef.status === Status.READY ?
        ftype === TPreseEnum.Steps ? <TemplateFormDialog {...(formd as any as StepsForm)} isform={false} /> :
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
            <InLine js={formdef.js} />
            {modalFormView}
        </Card>
    </React.Fragment>

    return <React.Fragment>
        <InLine js={formdef.js} />
        {props.ispage ? pagedialog : modaldialog}
    </React.Fragment>
})

export default ModalFormDialog
