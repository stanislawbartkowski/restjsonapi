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


import { ButtonAction, FGetValues, FOnFieldChanged, FOnValuesChanged, FSetValues, TAsyncRestCall, TClickButton, TField, TForm } from '../ts/typing'
import { log, trace } from '../../ts/l'
import { ButtonElem, FAction, FIELDTYPE, FieldValue, RESTMETH, TRow, VAction } from '../../ts/typing'
import { fieldType } from '../ts/transcol';
import { callJSFunction, commonVars, copyMap, getSessionId, isEmpty, isString } from '../../ts/j';
import { FFieldElem, findEditField, genEditClickedRowKey, getValue, istrue, okmoney, tomoney } from '../ts/helper';
import { transformSingleValue, transformValuesFrom, transformValuesTo } from '../ts/transformres';
import RestComponent from '../RestComponent';
import defaults from '../../ts/defaults';
import HeaderTable from '../HeaderTable'
import { ErrorMessages, FField, FMultiAction, FSearchAction, FSetEditRow, IFieldContext, TableRefresh, TFieldChange, TMultiSelect, UploadStore } from './formview/types';
import { produceItem } from './formview/EditItems'
import { produceBody } from './formview/FormBody';


function ltrace(mess: string) {
    trace('ModalFormView', mess)
}

export interface IRefCall {
    validate: () => void
    getValues: FGetValues
    refreshTable: (field: string) => void
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
const ModalFormView = forwardRef<IRefCall, TFormView & { restapiinitname?: string, setvarsaction: VAction, err: ErrorMessages, onValuesChanges: FOnValuesChanged, onFieldChange: FOnFieldChanged, aRest: TAsyncRestCall, getValues: FGetValues, setInitValues: FSetValues }>((props, ref) => {

    const [searchD, setSearchT] = useState<SearchDialogProps>(emptySearch);
    const [multiselectD, setMultiSelectD] = useState<MultiSelectProps>(emptySearch);
    const [fileupload, setFileUpload] = useState<UploadStore>(new Map())
    const fchanges = useRef<TFieldChange>({ fieldchange: new Set<string>(), notescalatewhenchange: new Set<string>(), nullfields: new Set<string> });
    const flastRowkey = useRef<TableEditClick>(new Map());
    const [multiselect, setMultiSelect] = useState<TMultiSelect>(new Map())
    const [tableR, setTableRefresh] = useState<TableRefresh>(new Map())
    const [refreshno, setRefreno] = useState<number>(0)

    const [f]: [FormInstance] = Form.useForm()


    const onFinish = (values: TRow) => {
        ltrace('Success, data validated')

        // do not copy restlist
        // Data: 2023/03/29
        const rlist : FFieldElem[] = props.list.filter( t => t.restlist === undefined)
        const tvals : TRow = transformValuesFrom(values, rlist, props.initvals) 

        props.buttonClicked(tvals)
    };

    const getV = (): TRow => {
        const r: TRow = f.getFieldsValue()
        // enrich wilth nulls
        for (let id of fchanges.current.nullfields) {
            const f: FFieldElem | undefined = props.fields.find(e => e.field === id)
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
        validate: () => {
            ltrace('submit');
            f.submit()
        },
        refreshTable(field: string) {
            ltrace('Refresh table {field}')
            const ntableR: TableRefresh = copyMap(tableR)
            ntableR.set(field, ntableR.get(field) !== undefined ? ntableR.get(field) as number + 1 : 1);
            setTableRefresh(ntableR)
        },
    }));

    useEffect(() => {

        console.log(props.initvals)
        let vals: TRow | undefined
        if (props.initvals) {
            ltrace("useEffect initvals")
            console.log(props.initvals)
            vals = transformValuesTo(props.initvals, props.list);
            ltrace("useEffect initvals transformed")
            console.log(vals)
        }
        // recalculate getVal
        const l: FFieldElem[] = props.list
        l.forEach(t => {
            if (t.value) {
                const value: FieldValue = getValue(t.value, { r: props.initvals ? props.initvals : {} });
                const v = transformSingleValue(value, t, false);
                if (vals === undefined) vals = {}
                vals[t.field] = v
            }
        })

        if (vals !== undefined) {
            f.setFieldsValue(vals);
            ltrace("useEffect initvals transformed only value")
            console.log(vals)
        }

    }, [props.initvals, refreshno])

    const buttonstop: ReactNode = props.buttonsextratop ? <React.Fragment><Form.Item><Space>{props.buttonsextratop}</Space></Form.Item><Divider /></React.Fragment> : undefined
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

    function setMulti(f: string, sel: FieldValue[]) {
        const s = new Map(multiselect)
        s.set(f, sel);
        setMultiSelect(s);
        props.onFieldChange(multiselectD.field)
        setMultiSelectD(emptySearch)
    }

    const closeMultiD: FAction = (b?: ButtonElem, r?: TRow) => {
        if (b?.choosefield === undefined) {
            setMultiSelectD(emptySearch)
            return;
        }
        const sel: FieldValue[] = (r as TRow)[defaults.multichoicevar] as FieldValue[]
        setMulti(multiselectD.field, sel)
        //const s = new Map(multiselect)
        //s.set(multiselectD.field, sel);
        //setMultiSelect(s);
        //props.onFieldChange(multiselectD.field)
        //setMultiSelectD(emptySearch)
    }

    const closeF: FAction = (b?: ButtonElem, r?: TRow) => {
        if (b?.choosefield === undefined) {
            setSearchT(emptySearch)
            return;

        }
        const val: FieldValue = (r as TRow)[b?.choosefield]
        if (val === undefined) return;
        setSearchT(emptySearch)
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

        const idn: NamePath = changedFields[0]["name"]
        const id: string = (isString(idn)) ? idn as string : (idn as string[])[0]
        // check if edit field
        const efield: TField | undefined = findEditField(id, props.fields)
        if (efield !== undefined && istrue(efield.refreshsum)) {
            // refesh
            renderD()
        }
        log(id + " changed")
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

    function modifyMoney(t: FField) {
        if (fieldType(t) !== FIELDTYPE.MONEY) return
        const r: TRow = f.getFieldsValue()
        const mval = r[t.field] as string
        if (!okmoney(mval)) return
        const m = tomoney(mval)
        log(m as string)
        f.setFieldValue(t.field, m)
    }

    const fieldContext: IFieldContext = {
        getChanges: function (): TFieldChange {
            return fchanges.current;
        },
        //        fieldChanged: function (id: string): void {
        //            props.onFieldChange(id);
        //        },
        fieldChanged: function (t: FField): void {
            modifyMoney(t);
            props.onFieldChange(t.field);
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
            console.log(sel)
            setMulti(t.field, sel)
        }
    }

    const setEditRow: FSetEditRow = (t: string, num: number) => {
        flastRowkey.current.set(t, num)
    }

    const renderD = () => {
        const currnumb: number = refreshno
        setRefreno(currnumb + 1)
    }

    function produceFormItem(f: TField) : ReactNode {
        return produceItem(
            fieldContext, 
            { ...f, searchF: searchF, multiF: multiF, tableR: tableR, setvarsaction: props.setvarsaction, seteditRow: setEditRow, rerenderD: renderD }, 
            props.err
        )
    }

    // must be preserve=true (default)
    ltrace(`Render`)
    const form = <Form
        form={f} onFinish={onFinish} onValuesChange={props.onValuesChanges} preserve={false}
        layout="horizontal" scrollToFirstError {...props.formprops} onFieldsChange={onFieldsChanges} >

        {buttonstop}

        {produceBody(props.fields, produceFormItem)}


        {buttonsbottom}

    </Form>

    const header: ReactNode | undefined = props.header ?
        <HeaderTable {...props.header} vars={props.vars} refreshaction={() => { }} fbutton={closeF} r={{}} selectedM={[]} ></HeaderTable> :
        undefined

    return <React.Fragment>
        {header}
        {form}
        <RestComponent  {...searchD.enterbutton as object} {...searchD.addpars} visible={searchD.visible} choosing closeAction={closeF} />
        <RestComponent  {...multiselectD.multichoice as object} {...multiselectD.addpars} visible={multiselectD.visible} closeAction={closeMultiD}
            initsel={multiselect.get(multiselectD.field)} multiselect vars={initvals} />
    </React.Fragment>
})

export default ModalFormView


