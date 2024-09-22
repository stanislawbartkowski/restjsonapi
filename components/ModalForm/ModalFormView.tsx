import React, { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';

import {
    //    Form,
    Space,
    Divider,
    FormListFieldData
} from 'antd';

import Form from 'antd/lib/form'
import { FieldData, NamePath } from 'rc-field-form/lib/interface';


import { FormInstance } from 'antd/es/form';


import { ButtonAction, FGetAutocomplete, FGetOptions, FGetValues, FOnFieldChanged, FOnValuesChanged, FRereadRest, FSetValues, TAsyncRestCall, TAutoCompleteMap, TClickButton, TField, TForm, TOptionLine, TRadioCheckItem } from '../ts/typing'
import { log, trace } from '../../ts/l'
import { ButtonElem, FAction, FIELDTYPE, FieldValue, FSetTitle, PropsType, RESTMETH, TRow, VAction } from '../../ts/typing'
import { fieldType } from '../ts/transcol';
import { callJSFunction, commonVars, copyMap, getSessionId, isBool, isEmpty, isString } from '../../ts/j';
import { emptys, FFieldElem, findEditField, flattenTForm, genEditClickedRowKey, getafterdot, getValue, istrue, okmoney, tomoney } from '../ts/helper';
import { transformSingleValue, transformValuesFrom, transformValuesTo } from '../ts/transformres';
import RestComponent from '../RestComponent';
import defaults from '../../ts/defaults';
import HeaderTable from '../HeaderTable'
import { ErrorMessages, FField, FMultiAction, FSearchAction, FSetEditRow, IFieldContext, TableRefresh, TableRefreshData, TFieldChange, TFieldsProps, TMultiSelect, TOptions, UploadStore } from './formview/types';
import { elemFactory, produceItem } from './formview/EditItems'
import { produceBody } from './formview/FormBody';
import { TRefreshTable } from '../DrawTable';
import { getCookie, setCookie } from '../../ts/cookies';
import getValidateMessaged from '../../ts/validatemessages'


export type FOkValidated = () => void

export interface IRefCall {

    validate: (ok: FOkValidated) => void
    getValues: FGetValues
    refreshTable: (field: string, refreshD?: TRefreshTable) => void
}

type TFormView = TForm & {
    buttonClicked: (row: TRow) => void
    buttonsextratop?: ReactNode
    buttonsextrabottom?: ReactNode
    initvals?: TRow
    list: FFieldElem[]
    vars?: TRow
    ignorerestapivals?: boolean
    clickButton: TClickButton
    listdef?: string
    rereadRest: FRereadRest
}


type SearchDialogProps = TField & {
    visible: boolean
    listfield?: FormListFieldData
    groupT?: TField
    addpars?: TRow
}

type MultiSelectProps = TField & {
    visible: boolean
    addpars?: TRow
}

type TableEditClick = Map<string, number>;


const emptySearch = { field: "", visible: false }


// getValues: used only to get values for field list
// setInitValues: used to pass values set during jsinitvals (JSON)
// restapiinitname: the name is passed only to useEffect to be raised only once
const ModalFormView = forwardRef<IRefCall, TFormView & { restapiinitname?: string, setinitvarsaction: VAction, setvarsaction: VAction, err: ErrorMessages, onValuesChanges: FOnValuesChanged, onFieldChange: FOnFieldChanged, aRest: TAsyncRestCall, getValues: FGetValues, setInitValues: FSetValues, fGetOptions?: FGetOptions, setTitle?: FSetTitle, fGetAutomplete?: FGetAutocomplete, switchDisplay?: ReactNode }>((props, ref) => {

    const [searchD, setSearchT] = useState<SearchDialogProps>(emptySearch);
    const [multiselectD, setMultiSelectD] = useState<MultiSelectProps>(emptySearch);
    const [fileupload, setFileUpload] = useState<UploadStore>(new Map())
    const fchanges = useRef<TFieldChange>({ fieldchange: new Set<string>(), notescalatewhenchange: new Set<string>(), nullfields: new Set<string> });
    const flastRowkey = useRef<TableEditClick>(new Map());
    const [multiselect, setMultiSelect] = useState<TMultiSelect>(new Map())
    const [tableR, setTableRefresh] = useState<TableRefresh>(new Map())
    const [refreshno, setRefreno] = useState<number>(0)
    const [options, setOptions] = useState<TOptions>(new Map())

    const [f]: [FormInstance] = Form.useForm()


    const onFinish = (values: TRow) => {
        // do not copy restlist
        // Data: 2023/03/29
        const rlist: FFieldElem[] = props.list.filter(t => t.restlist === undefined)
        const tvals: TRow = transformValuesFrom(values, rlist, props.initvals)

        props.buttonClicked(tvals)
    };

    const getV = (): TRow => {
        const r: TRow = f.getFieldsValue()
        const flist: TField[] = flattenTForm(props.fields as TField[])
        // enrich wilth nulls
        for (let id of fchanges.current.nullfields) {
            const f: FFieldElem | undefined = flist.find(e => e.field === id)
            if (f !== undefined && fieldType(f) === FIELDTYPE.STRING) r[id] = ""
        }
        return r
    }

    const getVals = (): TRow => {
        const r: TRow = getV()

        // extract uploads
        const uuid = getSessionId()
        for (let [id, list] of fileupload) {
            const l: string[] = list.map(e => uuid + "/" + e.name)
            r[id] = l
        }

        // last row key
        for (let [id, rowkey] of flastRowkey.current) {
            const rkey = genEditClickedRowKey(id)
            r[rkey] = rowkey
        }

        // multichoice
        for (let [id, mselect] of multiselect) {
            r[id] = mselect
        }

        return transformValuesFrom(r, props.list, props.initvals)
    }

    useImperativeHandle(ref, () => ({
        getValues: () => {
            return getVals()
        },
        validate: (ok: FOkValidated) => {
            //f.submit()
            f.validateFields().then(() => {
                ok()

            }).catch(() => { })
        },
        refreshTable(field: string, searchD: TRefreshTable | undefined) {

            const ntableR: TableRefresh = copyMap(tableR)
            const tableRE: TableRefreshData | undefined = ntableR.get(field)
            // 2023/11/08 start with refreshno=1 (not 0)
            const refreshno = istrue(searchD?.notwaitrefresh) ? tableRE?.refreshno : tableRE === undefined || tableRE.refreshno == undefined ? 1 : tableRE.refreshno + 1
            const newTableRE: TableRefreshData = {
                searchR: searchD,
                refreshno: refreshno
            }
            ntableR.set(field, newTableRE)
            setTableRefresh(ntableR)
        },
    }));

    useEffect(() => {

        let vals: TRow | undefined
        let multiselect: TMultiSelect | undefined
        if (props.initvals) {
            vals = transformValuesTo(props.initvals, props.list);
        }
        // recalculate getVal
        const l: FFieldElem[] = props.list
        l.forEach(t => {
            if (t.multichoice !== undefined && vals !== undefined) {
                if (multiselect === undefined) multiselect = new Map()
                multiselect?.set(t.field, vals[t.field] as FieldValue[])
            }
            const va: FieldValue = vals === undefined ? undefined : vals[t.field]
            if (fieldType(t) === FIELDTYPE.MONEY) {
                if (vals !== undefined) {
                    const m = trasformMoney(t, vals)
                    vals[t.field] = m
                }
            }
            if (t.radio && isString(va) && !emptys(va as string)) {
                const i: TRadioCheckItem[] = t.radio.items as TRadioCheckItem[]
                const iv: TRadioCheckItem | undefined = i.find(e => e.value == va as string)
                if (iv === undefined) {
                    log(`${va} not found in the items, empty value is assigned`)
                    if (vals !== undefined) {
                        vals[t.field] = ''
                    }
                }
            }
            if (t.value) {
                const vars: TRow = {}
                vars[defaults.currentfield] = t.field
                const value: FieldValue = getValue(t.value, { r: props.initvals ? props.initvals : {}, vars: vars });
                const v = transformSingleValue(value, t, false);
                if (vals === undefined) vals = {}
                vals[t.field] = v
            }
        })

        if (vals !== undefined) {
            f.setFieldsValue(vals);
        }
        if (multiselect !== undefined) {
            setMultiSelect(multiselect)
        }

    }, [props.initvals, refreshno])

    const buttonstop: ReactNode = props.buttonsextratop ? <React.Fragment><Form.Item><Space wrap>{props.buttonsextratop}</Space></Form.Item><Divider /></React.Fragment> : undefined
    const buttonsbottom: ReactNode = props.buttonsextrabottom ? <React.Fragment><Divider /><Form.Item><Space>{props.buttonsextrabottom}</Space></Form.Item></React.Fragment> : undefined

    // ==================

    function transform(t: FField): TRow | undefined {
        const jsrest: string | undefined = t?.enterbutton?.jsrest ? t?.enterbutton.jsrest : t?.multichoice?.jsrest
        if (jsrest === undefined) return undefined
        const r: TRow = props.getValues();
        const trest: TRow = callJSFunction(jsrest, { r: r })
        return trest;
    }

    const searchF: FSearchAction = (s: string, t: FField) => {
        setSearchT({ ...t, addpars: transform(t), visible: true })
    }

    const multiF: FMultiAction = (t: FField) => {
        setMultiSelectD({ ...t, addpars: transform(t), visible: true })
    }

    function destroyM() {
        const pmultiD = { ...multiselectD, visible: false, title: "" }
        setMultiSelectD(pmultiD)
    }

    function setMulti(f: string, sel: FieldValue[]) {
        const s = new Map(multiselect)
        s.set(f, sel);
        setMultiSelect(s);
        props.onFieldChange(multiselectD.field)
        //setMultiSelectD(emptySearch)
        destroyM()
    }

    const closeMultiD: FAction = (b?: ButtonElem, r?: TRow) => {
        if (b?.choosefield === undefined) {
            //setMultiSelectD(emptySearch)
            destroyM()
            return;
        }
        const sel: FieldValue[] = (r as TRow)[defaults.multichoicevar] as FieldValue[]
        setMulti(multiselectD.field, sel)
    }


    function destroyF() {
        const searchF = { ...searchD, visible: false, title: "" }
        setSearchT(searchF)
    }

    const closeF: FAction = (b?: ButtonElem, r?: TRow) => {
        if (b?.choosefield === undefined) {
            //setSearchT(emptySearch)
            destroyF()
            return;

        }
        const val: FieldValue = (r as TRow)[b?.choosefield]
        if (val === undefined) return;
        //setSearchT(emptySearch)
        destroyF()
        log(`${val} selected`)
        const x: TRow = getV()
        if (searchD.listfield === undefined) x[searchD.field] = val
        else {
            // list
            const a: TRow[] = (x[searchD.groupT ? searchD.groupT.field : searchD.field] as any)
            const elem: TRow = a[searchD.listfield.name]
            elem[searchD.field] = val
        }
        f.setFieldsValue(x)
        props.onFieldChange(searchD.field)
        // 2022/11/12 - validate form after choosing
        f.validateFields()
    }

    // ===================

    const initvals = { ...commonVars(), ...(props.initvals ? transformValuesTo(props.initvals as TRow, props.list) : undefined) }


    const onFieldsChanges = (changedFields: FieldData[], allFields: FieldData[]) => {
        if (isEmpty(changedFields)) return

        // do not call if error
        // 2023/01/22
        for (var ff of changedFields) {
            if (ff.errors !== undefined && ff.errors.length > 0) return;
        }

        // 2024/02/24
        // only when single field changes
        // multiply changes are triggered on validate
        if (changedFields.length > 1) return

        const idn: NamePath = changedFields[0]["name"]
        const id: string = (isString(idn)) ? idn as string : (idn as string[])[0]
        // check if edit field
        const efield: TField | undefined = findEditField(id, props.fields)
        if (efield !== undefined && istrue(efield.refreshsum)) {
            // refesh
            renderD()
        }
        // check, if field is null
        const r: TRow = f.getFieldsValue()
        if (r[id] === undefined) {
            fchanges.current.nullfields.add(id)
        }
        else fchanges.current.nullfields.delete(id)

        // if field is not triggered when blurred, escalates immediately
        if (!fchanges.current.notescalatewhenchange.has(id)) props.onFieldChange(id)
        else fchanges.current.fieldchange.add(id)
    }

    function trasformMoney(t: FFieldElem, r: TRow) {
        const mval = r[t.field] as string
        if (isString(mval)) {
            if (emptys(mval)) return undefined
            if (!okmoney(mval)) return undefined
        }
        // getafterdot
        const moneydot: string | undefined = (props.initvals !== undefined) ? props.initvals[defaults.moneydotvar] as string : undefined
        const m = tomoney(mval, getafterdot(t.moneydot, moneydot))
        return m
    }

    function modifyMoney(t: FField) {
        if (fieldType(t) !== FIELDTYPE.MONEY) return
        const r: TRow = f.getFieldsValue()
        const mval = r[t.field] as string
        const m = trasformMoney(t, r)
        if (m == undefined) return
        //if (emptys(mval)) return
        //if (!okmoney(mval)) return
        // getafterdot
        //const moneydot: string | undefined = (props.initvals !== undefined) ? props.initvals[defaults.moneydotvar] as string : undefined
        //const m = tomoney(mval, getafterdot(t.moneydot, moneydot))
        f.setFieldValue(t.field, m)
    }

    function gencookie(t: TField, addf?: string | undefined): string {
        const f: string = (props.listdef as string) + "-" + t.field
        return (addf === undefined) ? f : f + "-" + addf
    }

    const fieldContext: IFieldContext = {
        getChanges: function (): TFieldChange {
            return fchanges.current;
        },
        fieldChanged: function (t: FField, newval?: FieldValue): void {
            modifyMoney(t);
            props.onFieldChange(t.field, newval);
        },
        getValues: function (): TRow {
            return props.getValues();
            //return getVals()
        },
        aRest: function (r: RESTMETH, data: TRow): Promise<TRow> {
            return props.aRest(r, data);
        },
        upGet: function (): UploadStore {
            return fileupload;
        },
        upSet: function (p: UploadStore) {
            setFileUpload(p);
        },
        getMulti: function (): TMultiSelect {
            return multiselect;
        },
        clickButton: function (clickbutton?: ButtonAction | undefined, row?: TRow | undefined): void {
            props.clickButton(clickbutton, row);
        },
        setMulti: function (t: TField, sel: FieldValue[]): void {
            setMulti(t.field, sel);
        },
        fGetOptions: function (t: TField, value: string): void {
            if (props.fGetOptions === undefined || t.autocomplete === undefined)
                return;
            const a: TOptionLine[] = props.fGetOptions(t.autocomplete, value);
            const amap: TOptions = new Map(options);
            amap.set(t.autocomplete, a);
            setOptions(amap);
        },
        fReadCookie: function (t: TField, addf?: string | undefined): string | undefined {
            return getCookie(gencookie(t, addf));
        },
        fWriteCookie: function (t: TField, val: string | undefined, addf?: string | undefined): void {
            setCookie(gencookie(t, addf), val);
        },
        rereadRest: function (): void {
            props.rereadRest();
        },
        fieldsprops: function (): TFieldsProps | undefined {
            if (props.initvals === undefined || props.initvals[defaults.fieldsprops] === undefined) return undefined;
            return (props.initvals[defaults.fieldsprops] as any) as TFieldsProps;
        },
        fGetAutocomplete: function (): TAutoCompleteMap | undefined {
            return props.fGetAutomplete === undefined ? undefined : props.fGetAutomplete();
        },
        fgetFields: function (): FFieldElem[] {
            return props.list
        }
    }

    const setEditRow: FSetEditRow = (t: string, num: number) => {
        flastRowkey.current.set(t, num)
    }

    const renderD = () => {
        const currnumb: number = refreshno
        setRefreno(currnumb + 1)
    }

    function produceFormItem(f: TField, eFactory: elemFactory): ReactNode {

        //const aoptions: TOptionLine[] | undefined = f.autocomplete === undefined ? [] : options.get(f.autocomplete)
        return produceItem(
            fieldContext,
            { ...f, searchF: searchF, multiF: multiF, tableR: tableR, setinitvarsaction: props.setinitvarsaction, setvarsaction: props.setvarsaction, seteditRow: setEditRow, rerenderD: renderD, options: options },
            props.err,
            undefined,
            eFactory
        )
    }

    const validateMessages = getValidateMessaged()

    // must be preserve=true (default)
    const form = <Form validateMessages={validateMessages}
        form={f} onFinish={onFinish} onValuesChange={props.onValuesChanges} preserve={false}
        layout="horizontal" scrollToFirstError {...props.formprops} onFieldsChange={onFieldsChanges} >

        {buttonstop}

        {produceBody(props.fields, produceFormItem)}


        {buttonsbottom}

    </Form>

    if (props.setTitle !== undefined) {
        props.setTitle(undefined)
    }

    const hvalues: TRow = {
        ...props.getValues(),
        ...props.vars
    }

    const header: ReactNode | undefined = props.header ?
        <HeaderTable {...props.header} vars={hvalues} refreshaction={() => { }} fbutton={closeF} r={{}} selectedM={[]} setTitle={props.setTitle} rereadRest={props.rereadRest} closeAction={closeF} switchDisplay={props.switchDisplay}></HeaderTable> :
        undefined

    return <React.Fragment>
        {header}
        {form}
        <RestComponent  {...searchD.enterbutton as object} {...searchD.addpars} visible={searchD.visible} choosing closeAction={closeF} rereadRest={props.rereadRest} />
        <RestComponent  {...multiselectD.multichoice as object} {...multiselectD.addpars} visible={multiselectD.visible} closeAction={closeMultiD}
            initsel={multiselect.get(multiselectD.field)} multiselect vars={{ ...initvals, ...hvalues }} rereadRest={props.rereadRest} />
    </React.Fragment>
})

export default ModalFormView


