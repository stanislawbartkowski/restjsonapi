import React, { useState, useEffect, MutableRefObject, useRef, forwardRef, useImperativeHandle, ReactNode } from 'react';
import { Card } from 'antd';

import { ClickResult, FGetOptions, FGetValues, FOnFieldChanged, FRereadRest, FRetAction, FSetValues, PreseForms, StepsForm, TAction, TAsyncRestCall, TAutoComplete, TAutoCompleteMap, TClickButton, TColumn, TField, TOptionLine, TPreseEnum } from '../ts/typing'
import type { FGetAutocomplete, TForm } from '../ts/typing'
import type { ButtonAction } from '../ts/typing'
import { Status } from '../ts/typing'
import readdefs, { ReadDefsResult, rereadRest } from "../ts/readdefs";
import InLine from '../../ts/inline';
import constructButton from '../ts/constructbutton';
import ModalFormView, { FOkValidated, IRefCall } from './ModalFormView';
import { FFieldElem, flattenTForm, okmoney, cardProps, preseT, istrue, decomposeEditId } from '../ts/helper'
import { logG, trace } from '../../ts/l'
import { FAction, FButtonAction, FIELDTYPE, FSetProps, FSetTitle, FieldValue, ModalFormProps, RAction, RESTMETH, RowData, TComponentProps, TRow, VAction } from '../../ts/typing'
import { fieldType } from '../ts/transcol';
import lstring from '../../ts/localize';
import ReadDefError from '../errors/ReadDefError';
import StepsFormView from './StepsFormView';
import executeAction from '../ts/executeaction'
import { readvalsdata } from "../ts/readdefs";
import { callJSFunction, commonVars, isBool, isOArray, isString, toS } from '../../ts/j';
import RestComponent from '../RestComponent';
import { findErrField } from './formview/helper';
import { ErrorMessages, FField } from './formview/types';
import { readAutocomplete } from '../ts/readlist';
import defaults from '../../ts/defaults';
import { TRefreshTable } from '../DrawTable';

export type THooks = {
    aRest?: TAsyncRestCall,
    clickButton?: TClickButton
    getValues?: FGetValues
    setInitValues?: FSetValues
    fGetOptions?: FGetOptions
    fGetAutocomplete?: FGetAutocomplete
}

export interface IIRefCall {
    setMode: (loading: boolean, errors: ErrorMessages) => void,
    doAction?: (b: ClickResult) => void
    getVals: FGetValues
    // used while setting variables during execute actions
    setVals: FSetValues
    formGetVals: FGetValues
    retAction?: FRetAction
    rereadRest?: FRereadRest
}

export interface ModalHooks {

    setButtons: (buttons: ReactNode, loading: boolean) => void
    setTitle?: FSetTitle
    rereadRest: FRereadRest
    setModalProps?: FSetProps
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
    const [auto, setAuto] = useState<TAutoCompleteMap | undefined>(undefined)

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
        const v: TRow = getVals()
        const data: TRow = isTop ? { ...commonVars(), ...formdef.initvals, ...initvals, ...v, ...r } : { ...v, ...r }
        return data
    }

    const setinitvarsaction: VAction = (vars: TRow) => {
        // TODO: remove
        //setvarsaction(vars)
        //setInitVals(vars)
        const nvars: TRow = constructCurVals(vars)
        _setInitValues(nvars)
        //psetInitVals(nvars)
    }

    const setvarsaction: VAction = (vars: TRow) => {
        const fields: TColumn[] = createF()
        if (formdef.tabledata?.fields)
            createF().forEach(t => {
                if (t.restlist) {
                    let tData: TRefreshTable | undefined | RowData = (vars[t.field] as any) as TRefreshTable
                    if (!isOArray(tData)) {
                        let refresh: boolean = true
                        if (tData !== undefined) {
                            if (isBool(tData)) {
                                refresh = (tData as any) as boolean
                                tData = undefined
                            }
                            if (refresh)
                                ref.current.refreshTable(t.field, tData);
                            // 2024/04/21 zmiana
                            //vars[t.field] = false;
                            vars[t.field] = undefined;
                        }
                    }
                }
            })
        if (props.setvarsaction) props.setvarsaction(vars)
    }

    const rereadRestFun: FRereadRest = () => {
        const setF = (t: TField[]) => {
            const s: DataFormState = { ...formdef }
            s.tabledata = { ...(formdef.tabledata as TForm), fields: t }
            psetState(s)
        }
        const row: TRow = constructCurVals();
        rereadRest(props, setF, row)
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
        },
        retAction: (b: TAction, row: TRow) => {
            _clickButton(b as ButtonAction, row)
        },
        rereadRest: () => {
            rereadRestFun()
            if (ftype == TPreseEnum.Steps && sref.current.rereadRest !== undefined) sref.current.rereadRest()
            if (props.mhooks?.rereadRest) props.mhooks.rereadRest()
        }
    }

    useImperativeHandle(iref, () => (iiref)
    )

    // ====================================
    const _aRest: TAsyncRestCall = async (h: RESTMETH, r: TRow) => {

        const data: TRow = constructCurVals(r);
        return readvalsdata(h, {}, data)
    }

    const closeF: FAction = () => {
        //        if (ftype !== TPreseEnum.Steps)
        setRestView({ visible: false })
    }

    const _clickButton: TClickButton = (button?: TAction, row?: TRow) => {
        const nvars: TRow = constructCurVals(row)
        setInitVals(nvars);
        const res: TComponentProps | undefined = executeAction({ ...props, i: iiref }, button, nvars);
        if (res) {
            // 2023/06/02 -- added vars clause (risky)
            // 2023/06/10 -- added res.vars to clause vars
            setRestView({ visible: true, def: { ...res, visible: true, closeAction: closeF, vars: { ...props.vars, ...nvars, ...res.vars } } })
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
            if (props.aRest)
                return props.aRest(h, r);

            else
                return _aRest(h, r);
        },

        clickButton: (button?: ButtonAction, row?: TRow) => {
            if (props.clickButton)
                props.clickButton(button, row);

            else
                _clickButton(button, row);
        },
        getValues: () => {
            if (props.getValues)
                return props.getValues();
            const r: TRow = constructCurVals();
            return r;
        },
        setInitValues: (r: TRow) => {
            _setInitValues(r);
        },
        fGetOptions: (id: string, val: string) => {

            const autodef: TAutoComplete | undefined = formdef.tabledata?.autocomplete?.find(e => e.id === id);
            if (autodef === undefined)
                return [];

            const colname: string = autodef.colname ? autodef.colname : "name";
            const labelname: string | undefined = autodef.labelname

            function getV(r: TRow, colname: string): string | undefined {
                const t: FieldValue = r[colname];
                if (t === undefined)
                    return undefined;
                return toS(t);
            }


            function getN(r: TRow): string | undefined {
                return getV(r, colname)
            }

            function getL(r: TRow): string | undefined {
                return labelname !== undefined ? getV(r, labelname) : undefined
            }

            function okVal(r: TRow): boolean {
                const va: string | undefined = getN(r);
                if (va === undefined)
                    return false;
                const v: string = va.toUpperCase();
                return v.startsWith(val.toUpperCase());
            }

            const minlen: number = (autodef.minlen !== undefined) ? autodef.minlen : defaults.defstartnum;
            if (val.length < minlen)
                return [];
            const maxdispauto: number = (autodef.maxdisp !== undefined) ? autodef.maxdisp : defaults.maxdispauto;
            const rows: RowData | undefined = auto?.get(id);
            if (rows == undefined)
                return [];
            const n: RowData = rows.filter(r => okVal(r));
            const v: TOptionLine[] = n.slice(0, maxdispauto).map(r => {
                const value: string = getN(r) as string
                const label: string | undefined = getL(r)
                return label !== undefined ? { value: value, label: <span><strong>{value}</strong>  <i>{label}</i></span> } : { value: value };
            });
            return v;
        },
        fGetAutocomplete: () => {
            return auto
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


    const fclick: FButtonAction = (b: ButtonAction) => {
        buttonclicked.current = b
        const v: TRow = ref.current.getValues()
        const okV: FOkValidated = () => {
            clickButton(b, v);
        }
        if (b.validate) {
            if (!formvalidate(v)) return;
            const iref: IRefCall = ref.current
            iref.validate(okV)
        }
        else {
            //clickButton(b, v);
            okV()
        }
    }

    function onButtonClicked(r: TRow): void {
        clickButton(buttonclicked.current, r)
    }

    useEffect(() => {
        if (!props.ispage && props.mhooks) {
            const buttons: ReactNode = createB(formdef.tabledata, formdef.loading)
            props.mhooks.setButtons(buttons, formdef.loading as boolean)
        }
    }, [formdef.tabledata, formdef.loading, initvals])

    useEffect(() => {
        if (formdef.tabledata?.autocomplete === undefined) return
        function setS(auto: TAutoCompleteMap) {
            setAuto(auto)
        }
        readAutocomplete(formdef.tabledata.autocomplete, setS)

    }, [formdef.tabledata?.autocomplete]);


    useEffect(() => {

        if (props.listdef === undefined) return

        function setS(d: ReadDefsResult) {

            if (d.status === Status.READY) {
                const tabledata: TForm = { ...(d.res as TForm) }

                if (tabledata.modalprops !== undefined && props.mhooks?.setModalProps !== undefined)
                    props.mhooks.setModalProps(tabledata.modalprops)


                // 2022/08/30 (bez cookie)
                const vars: TRow | undefined = d.initvar !== undefined ? d.initvar : props.initvals
                //                const vars: TRow | undefined = d.initvar !== undefined ? d.initvar : isModalFormCookies(tabledata) ? getCookiesFormListDefVars(props.listdef as string) : props.initvals
                if (vars !== undefined) {
                }
                setState({
                    status: Status.READY,
                    tabledata: tabledata,
                    js: d.js,
                    err: [],
                    initvals: vars,
                });
                if (istrue(props.ignorerestapivals)) {
                    return undefined
                } else {
                    let jsvars: TRow | undefined = undefined
                    if (tabledata.jsrestapivals) {
                        jsvars = callJSFunction(tabledata.jsrestapivals as string, { r: {}, vars: props.vars as TRow });
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

    function findEditTable(tableid: string, fields: FFieldElem[]) {
        //const tf: TField | undefined = formdef.tabledata?.fields.find(e => e.field === tableid)
        const tf: TField | undefined = fields.find(e => e.field === tableid)
        return tf
    }

    function findFField(id: string): [FFieldElem | undefined, string | undefined, number | undefined] {
        const fields: FFieldElem[] = createF();
        const edittable: [string, string, number] | undefined = decomposeEditId(id)
        if (edittable === undefined) return [fields.find(e => e.field === id), undefined, undefined]
        // 2024/04/14 
        //const tf: TField | undefined = formdef.tabledata?.fields.find(e => e.field === edittable[0])
        const tf: TField | undefined = findEditTable(edittable[0], fields)
        if (tf === undefined) return [undefined, undefined, undefined]
        const efield: FFieldElem[] = flattenTForm(tf.items as FField[])
        return [efield.find(e => e.field === edittable[1]), edittable[0], edittable[2]]
    }

    const onFieldChange: FOnFieldChanged = (id: string, newval?: FieldValue) => {
        const felem = findFField(id)
        const f: FFieldElem | undefined = felem[0]
        if (f === undefined) return
        const addV: TRow = {}
        if (newval !== undefined) addV[id] = newval
        const v: TRow = { ...ref.current.getValues(), ...addV }
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

    const refreshAction: RAction = (r?: TAction) => {
        if (r?.vars) {
            iiref.setVals(r.vars)
        }
    }

    const popDialog: React.ReactNode = restview.visible ? <RestComponent {...restview.def} refreshaction={refreshAction} rereadRest={rereadRestFun} setvarsaction={iiref.setVals} /> : undefined

    const modalFormView: ReactNode = formdef.status === Status.READY ?
        ftype === TPreseEnum.Steps ? <StepsFormView ref={sref} vars={props.vars} {...props} {...(formd as any as StepsForm)} {...thooks} initvals={ivals} {...props.mhooks as ModalHooks} /> :
            <ModalFormView
                aRest={props.aRest as TAsyncRestCall}
                ref={ref} err={formdef.err}
                {...formd}
                buttonClicked={onButtonClicked}
                buttonsextrabottom={props.ispage ? createB(formdef.tabledata, formdef.loading) : undefined}
                onValuesChanges={onValuesChange}
                setvarsaction={setvarsaction}
                setinitvarsaction={setinitvarsaction}
                initvals={ivals}
                onFieldChange={onFieldChange}
                list={createF()}
                vars={props.vars}
                ignorerestapivals={props.ignorerestapivals}
                getValues={thooks.getValues as FGetValues}
                setInitValues={thooks.setInitValues as FSetValues}
                restapiinitname={restapiname}
                clickButton={clickButton}
                setTitle={props.mhooks?.setTitle}
                listdef={props.listdef}
                rereadRest={rereadRestFun}
                fGetAutomplete={thooks.fGetAutocomplete}
                switchDisplay={props.switchDisplay}
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