import React, { useState, useEffect, MutableRefObject, useRef, forwardRef, useImperativeHandle, ReactNode } from 'react';
import { Card, TransferProps } from 'antd';

import { ClickResult, FGetValues, FOnFieldChanged, FSetValues, PreseForms, StepsForm, TAction, TAsyncRestCall, TClickButton, TField, TPreseEnum } from '../ts/typing'
import type { TForm } from '../ts/typing'
import type { ButtonAction } from '../ts/typing'
import { Status } from '../ts/typing'
import readdefs, { ReadDefsResult } from "../ts/readdefs";
import InLine from '../../ts/inline';
import constructButton, { FClickButton } from '../ts/constructbutton';
import ModalFormView, { IRefCall, ErrorMessages, findErrField } from './ModalFormView';
import { FFieldElem, flattenTForm, okmoney, cardProps, setCookiesFormListDefVars, getCookiesFormListDefVars, preseT, istrue } from '../ts/helper'
import { logG, trace } from '../../ts/l'
import { FAction, FIELDTYPE, FieldValue, ModalFormProps, RESTMETH, TComponentProps, TRow, VAction } from '../../ts/typing'
import { fieldType } from '../ts/transcol';
import lstring from '../../ts/localize';
import ReadDefError from '../errors/ReadDefError';
import StepsFormView from './StepsFormView';
import executeAction from '../ts/executeaction'
import { readvalsdata } from "../ts/readdefs";
import { callJSFunction, commonVars, isString } from '../../ts/j';
import RestComponent from '../RestComponent';

export type { ErrorMessage, ErrorMessages } from './ModalFormView';

export type THooks = {
    aRest?: TAsyncRestCall,
    clickButton?: TClickButton
    getValues?: FGetValues
    setInitValues?: FSetValues
}

export interface IIRefCall {
    setMode: (loading: boolean, errors: ErrorMessages) => void,
    doAction?: (b: ClickResult) => void
    getVals: FGetValues
    // used while setting variables during execute actions
    setVals: FSetValues
    formGetVals: FGetValues
}

export interface ModalHooks {

    setButtons: (buttons: ReactNode, loading: boolean) => void
}


type DataFormState = {
    status: Status;
    tabledata?: TForm;
    js?: any,
    err: ErrorMessages
    loading?: boolean
    initvals: TRow | undefined
    propsinitvals?: TRow
};

const emptyTForm: TForm = {
    fields: [],
    buttons: []
}

function ltrace(mess: string) {
    trace('ModalForm', mess)
}

type MModalFormProps = ModalFormProps & {
    mhooks?: ModalHooks
    listdef?: string
    vars?: TRow
    initvals?: TRow
    ignorerestapivals?: boolean
}

function isCookiesButton(b: ButtonAction): boolean {
    return (b.print !== undefined && b.print) || (b.cookie !== undefined && b.cookie)
}

function setVarsCookies(p: MModalFormProps, b: ButtonAction, r: TRow) {
    if (isCookiesButton(b)) {
        setCookiesFormListDefVars(p.listdef as string, r);
    }
}

function isModalFormCookies(p: TForm): boolean {
    if (p.buttons === undefined || p.buttons === null) return false
    const b: ButtonAction | undefined = p.buttons.find(b => isCookiesButton(b))
    return b !== undefined
}

type PopDialogView = {
    def?: TComponentProps
    visible: boolean
}

const ModalFormDialog = forwardRef<IIRefCall, MModalFormProps & THooks>((props, iref) => {

    const buttonclicked = useRef<ButtonAction | undefined>(undefined);

    const [formdef, psetState] = useState<DataFormState>({
        status: Status.PENDING,
        tabledata: emptyTForm,
        err: [],
        initvals: undefined,
        // propsinitvals: props.initvals
    });

    const [restview, setRestView] = useState<PopDialogView>({ visible: false });
    const [initvals, psetInitVals] = useState<TRow>({ ...props.vars });

    function setState(p: DataFormState) {
        psetState(p)
    }


    const isTop: boolean = props.setInitValues === undefined

    function setInitVals(r: TRow) {
        if (isTop)
            psetInitVals({ ...r });
    }


    const [buttontrigger, setButtonTrigger] = useState<ButtonAction | undefined>()

    const ref: MutableRefObject<IRefCall> = useRef<IRefCall>() as MutableRefObject<IRefCall>
    const sref: MutableRefObject<IIRefCall> = useRef<IIRefCall>() as MutableRefObject<IIRefCall>

    const formd: TForm = (formdef.tabledata as TForm)

    const ftype: TPreseEnum | undefined = formdef.status === Status.READY ? preseT(formd) : undefined

    const getVals: FGetValues = () => {
        return ftype === TPreseEnum.Steps ?
            (sref.current === undefined || sref.current === null) ? {} : sref.current.getVals() :
            (ref.current === undefined || ref.current === null) ? {} : ref.current.getValues()
    }

    const constructCurVals = (r?: TRow): TRow => {
        const data: TRow = isTop ? { ...commonVars(), ...formdef.initvals, ...initvals, ...getVals(), ...r } : { ...getVals(), ...r }
        return data
    }

    const setvarsaction: VAction = (vars: TRow) => {
        if (formdef.tabledata?.fields)
            formdef.tabledata?.fields.forEach(t => {
                if (t.restlist) {
                    if (istrue(vars[t.field] as boolean)) {
                        ref.current.refreshTable(t.field);
                        vars[t.field] = false;
                    }
                }
            })
        if (props.setvarsaction) props.setvarsaction(vars)
    }


    const iiref: IIRefCall = {
        setMode: (loading: boolean, errors: ErrorMessages) => {
            if (ftype === TPreseEnum.Steps)
                sref.current.setMode(loading, errors);
            else
                setState({ ...formdef, err: errors, loading: loading });
        },
        getVals: () => {
            return constructCurVals()
        },
        setVals: (r: TRow) => {
            // setVals(r);
            const vars: TRow = constructCurVals(r);

            setvarsaction(vars)
            setInitVals(vars);
        },
        doAction: (b: ClickResult) => {
            if (ftype === TPreseEnum.Steps)
                if (sref.current?.doAction)
                    sref.current?.doAction(b);
        },
        formGetVals: function (): TRow {
            return getVals();
        }
    }

    useImperativeHandle(iref, () => (iiref)
    )

    // ====================================
    const _aRest: TAsyncRestCall = async (h: RESTMETH, r: TRow) => {

        const data: TRow = constructCurVals(r);
        return readvalsdata(h, data)
    }

    const closeF: FAction = () => {
        setRestView({ visible: false })
    }

    const _clickButton: TClickButton = (button?: TAction, row?: TRow) => {
        const nvars: TRow = constructCurVals(row)
        setInitVals(nvars);
        const res: TComponentProps | undefined = executeAction({ ...props, i: iiref }, button, nvars);
        console.log(row)
        if (res) {
            setRestView({ visible: true, def: { ...res, visible: true, closeAction: closeF } })
        }
    }


    const _setInitValues = (r: TRow) => {
        if (props.setInitValues) {
            props.setInitValues(r);
            return
        }
        const ar: TRow = { ...initvals, ...r }
        setInitVals({ ...ar })
    }


    const thooks: THooks = {
        aRest: async (h: RESTMETH, r: TRow) => {
            if (props.aRest) return props.aRest(h, r);
            else return _aRest(h, r);
        },

        clickButton: (button?: ButtonAction, row?: TRow) => {
            if (props.clickButton) props.clickButton(button, row);
            else _clickButton(button, row);
        },
        getValues: () => {
            if (props.getValues) return props.getValues();
            //const r: TRow = { ...initvals, ...getVals() }
            const r: TRow = constructCurVals()
            return r
        },
        setInitValues: (r: TRow) => {
            _setInitValues(r);
        }
    }

    const clickButton: TClickButton = (button?: ButtonAction, row?: TRow) => {
        if (thooks.clickButton) thooks.clickButton(button, row);
    }


    // =========================================

    const createL = (loading: boolean | undefined) => {
        const load: boolean = istrue(loading)
        return load
    }

    const createF = () => {
        const fields: FFieldElem[] = preseT(formdef.tabledata as PreseForms) === TPreseEnum.TForm ? flattenTForm(formdef.tabledata?.fields as TField[]) : []
        return fields

    }

    const createB = (tabledata: TForm | undefined, loading: boolean | undefined) => {
        const load: boolean = createL(loading);
        return tabledata?.buttons ?
            tabledata.buttons.map(e => constructButton(e, fclick, load, load && e.id === buttonclicked.current?.id)) :
            undefined
    }


    function formvalidate(r: TRow): boolean {
        let ok: boolean = true
        const fields: FFieldElem[] = createF();
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
            clickButton(b, v);
        }
        setVarsCookies(props, b, v);
    }

    function onButtonClicked(r: TRow): void {
        clickButton(buttonclicked.current, r)
    }


    // initvals dodane 2022/08/18
    useEffect(() => {
        if (!props.ispage && props.mhooks) {
            const buttons: ReactNode = createB(formdef.tabledata, formdef.loading)
            props.mhooks.setButtons(buttons, formdef.loading as boolean)
        }
    }, [formdef.tabledata, formdef.loading, initvals])


    useEffect(() => {

        if (props.listdef === undefined) return

        function setS(d: ReadDefsResult) {

            if (d.status === Status.READY) {
                const tabledata: TForm = { ...(d.res as TForm) }

                // 2022/08/30 (bez cookie)
                const vars: TRow | undefined = d.initvar !== undefined ? d.initvar : props.initvals
                //                const vars: TRow | undefined = d.initvar !== undefined ? d.initvar : isModalFormCookies(tabledata) ? getCookiesFormListDefVars(props.listdef as string) : props.initvals
                if (vars !== undefined) {
                    ltrace("readdefs")
                    console.log(vars)
                }
                setState({
                    status: Status.READY,
                    tabledata: tabledata,
                    js: d.js,
                    err: [],
                    initvals: vars,
                });
                if (istrue(props.ignorerestapivals)) {
                    if (formdef.tabledata?.jsrestapivals) ltrace("Ignore jsrestapivals for the second time")
                    return undefined
                } else {
                    let jsvars: TRow | undefined = undefined
                    if (tabledata.jsrestapivals) {
                        jsvars = callJSFunction(tabledata.jsrestapivals as string, { r: {}, vars: props.vars as TRow });
                        ltrace("useEffect jsrestapivals")
                        console.log(initvals)
                    }
                    const ar: TRow = { ...d.initvar, ...jsvars }
                    _setInitValues(ar)
                }
            }
            else {
                logG.error(`Error while reading definition`)
                setState({ status: Status.ERROR, err: [], initvals: undefined })
            }

        }

        readdefs(props, setS, props.ignorerestapivals)

    }, [props.listdef]);

    // important: to run trigger button exactly once
    useEffect(() => {
        if (buttontrigger) {
            fclick(buttontrigger)
        }

    }, [buttontrigger]);


    if (formdef.status === Status.PENDING) return null;


    if (formdef.status === Status.ERROR) return <ReadDefError />


    function onValuesChange(changedFields: Record<string, any>, allFields: Record<string, any>) {

        if (formdef.err.length === 0) return;
        const remove: Set<string> = new Set<string>()
        for (const e of Object.keys(changedFields)) {
            if (findErrField(e, formdef.err)) remove.add(e)
        }

        if (remove.size === 0) return

        // 2022/11/04 -- error
        const v = constructCurVals()
        setInitVals(v)

        const err: ErrorMessages = formdef.err.filter(e => !remove.has(e.field))
        setState({ ...formdef, err: err })
    }

    const onFieldChange: FOnFieldChanged = (id: string) => {
        const fields: FFieldElem[] = createF();
        const f: FFieldElem | undefined = fields.find(e => e.field === id)
        if (f === undefined) return
        const v: TRow = ref.current.getValues()
        console.log(v)
        if (f.onchange) {
            clickButton(f.onchange, v)
        }
    }


    if (ftype === TPreseEnum.TForm && buttontrigger === undefined) {
        const tr: ButtonAction | undefined = formd.buttons ? formd.buttons.find(e => e.trigger) : undefined
        if (tr) setButtonTrigger(tr)
    }


    //    const ivals: TRow = thooks.getValues ? thooks.getValues() : initvals
    const _mvals: TRow = isTop ? { ...initvals } : {}
    const ivals: TRow = { ...props.initvals, ..._mvals }

    // restapiname is passed to ModalFormView to trigger useEffect with definitvats only once
    // if more then once then it will overwrite variable to the beginning values
    const restapiname = formdef.tabledata?.restapivals ? isString(formdef.tabledata?.restapivals) ? formdef.tabledata?.restapivals as string : (formdef.tabledata?.restapivals as RESTMETH).restaction : undefined

    const popDialog: React.ReactNode = restview.visible ? <RestComponent {...restview.def} /> : undefined

    const modalFormView: ReactNode = formdef.status === Status.READY ?
        ftype === TPreseEnum.Steps ? <StepsFormView ref={sref} vars={props.vars} {...props} {...(formd as any as StepsForm)} {...thooks} initvals={ivals} /> :
            <ModalFormView
                aRest={props.aRest as TAsyncRestCall}
                ref={ref} err={formdef.err}
                {...formd}
                buttonClicked={onButtonClicked}
                buttonsextrabottom={props.ispage ? createB(formdef.tabledata, formdef.loading) : undefined}
                onValuesChanges={onValuesChange}
                setvarsaction={setvarsaction}
                initvals={ivals}
                onFieldChange={onFieldChange}
                list={createF()}
                vars={props.vars}
                ignorerestapivals={props.ignorerestapivals}
                getValues={thooks.getValues as FGetValues}
                setInitValues={thooks.setInitValues as FSetValues}
                restapiinitname={restapiname}

                {...thooks}
            />
        : undefined

    const modaldialog: ReactNode = modalFormView

    const pagedialog: ReactNode = <React.Fragment>
        <Card {...cardProps(formdef.tabledata)} >
            <InLine js={formdef.js} />
            {modalFormView}
        </Card>
    </React.Fragment>

    return <React.Fragment>
        <InLine js={formdef.js} />
        {props.ispage ? pagedialog : modaldialog}
        {popDialog}
    </React.Fragment>
})

export default ModalFormDialog