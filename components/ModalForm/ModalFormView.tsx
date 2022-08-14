import React, { FocusEventHandler, forwardRef, MutableRefObject, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';

import {
    Form,
    Input,
    DatePicker,
    InputNumber,
    Space,
    Divider,
    Switch,
    Radio,
    Checkbox,
    Select,
    SelectProps,
    Button,
    Card,
    List,
    message,
    Upload,
    UploadProps,
    Badge
} from 'antd';
import { FormInstance, Rule } from 'antd/es/form';
import type { ValidateStatus } from 'antd/lib/form/FormItem';
import { CloseOutlined, CheckOutlined, MinusCircleOutlined, PropertySafetyFilled, UploadOutlined } from '@ant-design/icons';


import { ButtonAction, FGetValues, FieldRestList, FOnFieldChanged, FOnValuesChanged, FSetValues, MultiChoiceButton, RestValidatorResult, StatisticType, TAsyncRestCall, TField, TForm, TListItems, TRadioCheckItem, UploadType, ValidatorType } from '../ts/typing'
import { log, trace } from '../../ts/l'
import { ButtonElem, FAction, FIELDTYPE, FieldValue, FormMessage, PropsType, RESTMETH, RestTableParam, TRow } from '../../ts/typing'
import { fieldTitle, fieldType, HTMLElem, makeDivider, makeStatItem } from '../ts/transcol';
import { callJSFunction, commonVars, copyMap, getButtonName, getSessionId, isEmpty, makeMessage } from '../../ts/j';
import getIcon from '../../ts/icons';
import lstring from '../../ts/localize';
import { FFieldElem, getValue, isItemGroup, isnotdefined, istrue } from '../ts/helper';
import { transformSingleValue, transformValuesFrom, transformValuesTo } from '../ts/transformres';
import RestComponent from '../RestComponent';
import { cardProps } from '../ts/helper'
import defaults from '../../ts/defaults';
import HeaderTable from '../HeaderTable'
import { RcFile } from 'antd/lib/upload';
import { getHost } from '../../services/api';
import { constructButtonElem } from '../ts/constructbutton';
import { UploadFile } from 'antd/lib/upload/interface';
import RestTable from "../RestTable"

type FSearchAction = (s: string, t: FField) => void
type FMultiAction = (t: FField) => void
type TMultiSelect = Map<string, FieldValue[]>;
type TableRefresh = Map<string, number>;


type FField = TField & {

    searchF: FSearchAction
    multiF: FMultiAction
    tableR: TableRefresh
    name?: number
    groupT?: TField
}

type TFieldChange = {
    fieldchange: Set<string>;
    notescalatewhenchange: Set<string>
}

const { RangePicker } = DatePicker;

export type ErrorMessage = {
    field: string,
    message: string
}

export type ErrorMessages = ErrorMessage[]

function ltrace(mess: string) {
    trace('ModalFormView', mess)
}

export interface IRefCall {
    validate: () => void
    getValues: FGetValues
    refreshTable: (field: string) => void
}

type UploadStore = Map<string, UploadFile[]>

interface IFieldContext {
    getChanges: () => TFieldChange
    fieldChanged: (id: string) => void
    getValues: FGetValues
    aRest: TAsyncRestCall
    upGet: () => UploadStore
    upSet: (p: UploadStore) => void
    getMulti: () => TMultiSelect
}

type TFormView = TForm & {
    buttonClicked: (row: TRow) => void
    buttonsextratop?: ReactNode
    buttonsextrabottom?: ReactNode
    initvals?: TRow
    list: FFieldElem[]
    vars?: TRow
    ignorerestapivals?: boolean
}


export function placeHolder(t: TField) {
    if (t.placeholder) {
        const placeH: string = makeMessage(t.placeholder) as string
        return { placeholder: placeH }
    }
    return undefined;
}

// -------- radio

function itemName(e: TRadioCheckItem): string | undefined {
    return makeMessage(e.label, { r: {} })
}

function createRadioItem(e: TRadioCheckItem, button?: boolean): ReactNode {

    if (button) return <Radio.Button value={e.value} {...e.props}>{itemName(e)}</Radio.Button>
    return <Radio value={e.value} {...e.props}>{itemName(e)}</Radio>

}

function createRadioGroup(t: TField): ReactNode {

    return <Radio.Group {...t.iprops}>
        {
            (t.radio?.items as TRadioCheckItem[]).map(e => createRadioItem(e, t.radio?.button))
        }

    </Radio.Group>
}

function isNotRequired(t: TField): boolean {
    if (t.validate === undefined) return true;
    const v: ValidatorType | undefined = t.validate.find(t => t.required)
    return v === undefined || v.required === undefined || !v.required
}

function createSelectGroup(t: TField, items: TRadioCheckItem[], multi: boolean): ReactNode {

    const clear: SelectProps = isNotRequired(t) ? { allowClear: true } : { allowClear: false }
    const p: SelectProps = multi ? { mode: "multiple" } : {}

    return <Select {...p} {...clear} {...t.iprops} {...placeHolder(t)} >
        {
            items.map(e => <Select.Option value={e.value} {...e.props}>{itemName(e)}</Select.Option>)
        }
    </Select>

}

//  ---- checkbox

function createCheckBoxGroup(t: TField): ReactNode {
    return <Checkbox.Group {...t.props}>
        {
            (t.checkbox?.items as TRadioCheckItem[]).map(e => <Checkbox value={e.value} {...e.props}> {itemName(e)} </Checkbox>)
        }

    </Checkbox.Group>
}

// =========================================
// should exist in the same module
// =========================================

function enterButton(t: TField) {
    if (t.enterbutton) {
        const searchB: string = makeMessage(t.enterbutton) as string;
        return { enterButton: searchB }
    }
    return undefined
}


function searchItem(ir: IFieldContext, t: FField, name?: number): React.ReactNode {

    const onBlur: FocusEventHandler<HTMLInputElement> = (c: React.FocusEvent) => {
        const id: string = c.target.id
        log(id + " on blur")
        checkchange(ir, c.target.id)
    }

    function onSearchButton(value: string) {
        t.searchF(value, { ...t, name: name });
    }

    return <Input.Search onBlur={onBlur} {...placeHolder(t)}  {...t.iprops}  {...enterButton(t)} onSearch={onSearchButton} />
}

// ===========================================

interface HTMLProps {
    value?: string
    onChange?: (value: string) => void
}

const HTMLControl: React.FC<HTMLProps> = (props) => {
    return HTMLElem(props.value);
}

function checkchange(ir: IFieldContext, id: string) {

    const ch: TFieldChange = ir.getChanges()
    const exist: boolean = ch.fieldchange.has(id)
    if (exist) {
        ch.fieldchange.delete(id)
        ir.fieldChanged(id)
    }

}

function produceElem(ir: IFieldContext, t: FField, err: ErrorMessages, name?: number): [React.ReactNode, PropsType | undefined] {

    const onBlur: FocusEventHandler<HTMLInputElement> = (c: React.FocusEvent) => {
        const id: string = c.target.id
        log(id + " on blur")
        checkchange(ir, c.target.id)
    }

    if (isItemGroup(t)) {
        return [<React.Fragment>
            {(t.items as TField[]).map(e => produceItem(ir, { ...e, searchF: t.searchF, groupT: t, multiF: t.multiF, tableR: t.tableR }, err, name))}
        </React.Fragment>,
            undefined]
    }

    if (t.radio)
        if (t.radio.select) return [createSelectGroup(t, t.radio.items as TRadioCheckItem[], false), undefined]
        else return [createRadioGroup(t), undefined]

    if (t.checkbox)
        if (t.checkbox.select) return [createSelectGroup(t, t.checkbox.items as TRadioCheckItem[], true), undefined]
        else return [createCheckBoxGroup(t), undefined]

    const fieldtype: FIELDTYPE = fieldType(t)

    // except boolean/switch - change reported when blurred
    if (fieldtype !== FIELDTYPE.BOOLEAN && fieldtype !== FIELDTYPE.DATE) ir.getChanges().notescalatewhenchange.add(t.field)

    let valuep = {}
    let disabledp = {}

    //    if (t.value) {
    //        const value: FieldValue = getValue(t.value, { r: ir.getValues() });
    //        const v = transformSingleValue(value, t, false);
    //        valuep = fieldtype !== FIELDTYPE.BOOLEAN ? valuep = { initialValue: v } :
    //            (v as boolean) ? { initialValue: "checked" } : {}
    //        if (fieldtype !== FIELDTYPE.HTML) disabledp = { disabled: true }
    //    }

    // set value here only for boolean
    if (t.value) {
        const value: FieldValue = getValue(t.value, { r: ir.getValues() });
        const v = transformSingleValue(value, t, false);
        valuep = fieldtype === FIELDTYPE.BOOLEAN ? (v as boolean) ? { initialValue: "checked" } : {} : {}
        if (fieldtype !== FIELDTYPE.HTML) disabledp = { disabled: true }
    }

    switch (fieldtype) {
        case FIELDTYPE.NUMBER: return [<InputNumber onBlur={onBlur} {...placeHolder(t)} {...t.iprops} {...disabledp} />, { ...valuep }]
        case FIELDTYPE.DATE:
            if (t.range) return [<RangePicker {...t.iprops} />, undefined]
            return [<DatePicker  {...t.iprops} {...disabledp} />, { ...valuep }]
        case FIELDTYPE.BOOLEAN: return [<Switch {...t.iprops}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            {...disabledp}
        />, { valuePropName: "checked", ...valuep }
        ]
        case FIELDTYPE.HTML: return [<HTMLControl />, { ...valuep }]
    }

    return t.enterbutton ? [searchItem(ir, t, name), undefined] :
        [<Input onBlur={onBlur} {...placeHolder(t)}  {...t.iprops} {...disabledp} />, { ...valuep }]
}

export function findErrField(field: string, err: ErrorMessages): ErrorMessage | undefined {
    return err.find(e => e.field === field)
}

function errorMessage(t: FField, err: ErrorMessages): {} | { validateStatus: ValidateStatus, help: string[] } {
    const e: ErrorMessage | undefined = findErrField(t.field, err)
    if (e === undefined) return {}
    return { validateStatus: 'error', help: [e.message] }
}

function createRules(ir: IFieldContext, t: FField): [Rule[] | undefined, boolean] {

    const fieldtype: FIELDTYPE = fieldType(t)

    const rules: Rule[] = []
    let required: boolean = false

    if (fieldtype === FIELDTYPE.MONEY) rules.push({ pattern: new RegExp(/^[+-]?\d*\.?\d*$/), message: lstring("moneypattern") })

    if (t.validate)
        t.validate.forEach(e => {
            const message: string | undefined = e.message ? makeMessage(e.message) : undefined
            if (e.required) {
                rules.push({ required: true, message: message })
                required = true
            }
            if (e.pattern) {
                rules.push({ pattern: new RegExp(e.pattern), message: message })
            }
            if (e.restaction) {
                rules.push(
                    ({ getFieldValue }) => ({
                        async validator(_, value) {
                            if (value === undefined) return Promise.resolve();
                            const data: TRow = {}
                            data[t.field] = value
                            data[defaults.currentfield] = value
                            const h: RESTMETH = e.restaction as RESTMETH;
                            const dat: TRow = await ir.aRest(h, data)

                            const res: RestValidatorResult = dat
                            if (res.err === undefined) return Promise.resolve();
                            const errmess: string = makeMessage(res.err as FormMessage) as string
                            return Promise.reject(new Error(errmess))
                        }
                    }

                    ))
            }

        })

    return [rules.length === 0 ? undefined : rules, required]

}


function produceFormItem(ir: IFieldContext, t: FField, err: ErrorMessages, name?: number): React.ReactNode {

    const [rules, required] = createRules(ir, t)
    const props = { ...t.props }
    if (props.rules && rules) {
        props.rules = rules.concat(props.rules)
    }
    else if (rules) props.rules = rules

    // checked for boolean and not radio (important)
    const addprops = (t.fieldtype === FIELDTYPE.BOOLEAN && t.radio === undefined) ? { valuePropName: "checked" } : undefined

    const elemp = produceElem(ir, t, err, name)

    const requiredprops = required ? { required: true } : undefined

    const mess: string = fieldTitle(t, { r: {} });
    return <Form.Item {...props} {...requiredprops} id={t.field} name={name !== undefined ? [name, t.field] : t.field} key={t.field} label={mess} {...errorMessage(t, err)} {...addprops} {...elemp[1]}>
        {elemp[0]}
    </Form.Item>
}

// ================================
// list item
// ================================


function createList(ir: IFieldContext, t: FField, err: ErrorMessages): ReactNode {

    const addButton: ButtonElem = t.list?.addbutton as ButtonElem

    const plusicon: ReactNode = getIcon(addButton.icon ? addButton.icon : 'plusoutlined');

    const addname = getButtonName(addButton)

    return <Card bordered {...cardProps(t.list?.card)}><Form.List name={t.field} key={t.field} {...t.list?.props} >
        {(fields, { add, remove }) => (
            <>
                {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        {produceFormItem(ir, t, err, name)}
                        <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                ))}
                <Form.Item>
                    <Button type="dashed" onClick={() => add()} block {...addButton.props} icon={plusicon}>
                        {addname}
                    </Button>
                </Form.Item>
            </>
        )}

    </Form.List>
    </Card>
}



function transformToListItem(t: FField, li: TListItems, r: TRow): React.ReactNode {

    const ftype: FIELDTYPE = fieldType(t)
    const value: FieldValue = isnotdefined(r[t.field]) ? lstring("notdefined") : r[t.field]
    let values: string = value as string
    if (ftype === FIELDTYPE.BOOLEAN && !isnotdefined(r[t.field])) values = (value as boolean) ? lstring("yes") : lstring("no")

    const title: string = fieldTitle(t, { r: r })

    return <List.Item {...li.iprops}><Space {...li.lprops}>{title}</Space><Space {...li.vprops}> {values}</Space></List.Item>
}


function createItemList(ir: IFieldContext, t: FField, err: ErrorMessages): ReactNode {
    const li: TListItems = t.itemlist as TListItems
    const r: TRow = ir.getValues()
    const dsource: FField[] = t.items as FField[]
    const header = li.header ? makeMessage(li.header, { r: r }) : undefined
    const footer = li.footer ? makeMessage(li.footer, { r: r }) : undefined
    return <List size="small" header={header} footer={footer} dataSource={dsource} {...li.props} renderItem={(item: FField) => transformToListItem(item, li, r)} />
}

function produceStatIem(ir: IFieldContext, t: FField): React.ReactNode {
    return makeStatItem(t.stat as StatisticType, { r: ir.getValues() })
}

// ================
// upload button
// ================

function getUpPars(file: RcFile): string {
    const fname = file.name
    const host = getHost()
    const uuid = getSessionId()
    return `${host}/upload?filename=${uuid}/${fname}`
}

const customRequest = (options: any) => {
    fetch(options.action, {
        method: 'POST',
        body: options.file
    }
    )
        .then(result => {
            console.log('Success:', result);
            options.onSuccess()
        })
        .catch(error => {
            console.error('Error:', error);
            options.onError()
        });

}


function produceUploadItem(ir: IFieldContext, t: FField): ReactNode {
    const upload: UploadType = t.upload as UploadType
    const props: UploadProps = {
        name: 'file',
        action: getUpPars,
        headers: {},
        customRequest: customRequest,
        onChange(info) {
            const f: UploadFile[] = info.fileList
            const ss: Map<string, UploadFile[]> = ir.upGet()
            ss.set(t.field, f);
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                const mess = lstring('fileuploadedsuccess', info.file.name);
                // message.success(`${info.file.name} file uploaded successfully`);
                message.success(mess);
            } else if (info.file.status === 'error') {
                const mess = lstring('fileuploadedfailure', info.file.name);
                //message.error(`${info.file.name} file upload failed.`);
                message.error(mess);
            }
            if (info.file.status === 'done' || info.file.status === 'removed') {
                ir.upSet(ss)
            }
        },
        ...upload.uploadprops
    };

    const bu = constructButtonElem(upload, (b: ButtonAction) => { })

    //    return <Upload {...props }>
    //        <Button icon={<UploadOutlined />}>Click to Upload</Button>        
    //    </Upload>

    return <Upload {...props}>
        {bu}
    </Upload>

}

// ==================================
// multichoice button
// ==================================

function produceMultiChoiceButton(ir: IFieldContext, t: FField): ReactNode {

    const s: TMultiSelect = ir.getMulti()
    const se: FieldValue[] | undefined = s.get(t.field)
    const no = se === undefined ? 0 : se.length
    const mu: MultiChoiceButton = t.multichoice as MultiChoiceButton
    const bu = constructButtonElem(mu, (b: ButtonAction) => t.multiF(t))
    if (no === 0) return bu
    return <Badge count={no}>
        {bu}
    </Badge>
}

// ===========================
// RestTable as a field
// ===========================

function produceRestTable(ir: IFieldContext, t: FField): ReactNode {

    const frest: FieldRestList = t.restlist as FieldRestList
    const pars: RestTableParam = frest.js ? callJSFunction(frest.js, { r: ir.getValues() }) as RestTableParam : t.restlist as RestTableParam
    const vars: TRow = ir.getValues()
    const refreshno: number = t.tableR.has(t.field) ? t.tableR.get(t.field) as number : 0

    return <Form.Item id={t.field} name={t.field} {...t.props} >
        <RestTable {...pars} vars={vars} refreshno={refreshno} />
    </Form.Item>
}

function produceItem(ir: IFieldContext, t: FField, err: ErrorMessages, name?: number): ReactNode {

    if (t.multichoice) return produceMultiChoiceButton(ir, t)
    if (t.itemlist) return createItemList(ir, t, err);
    if (t.list) return createList(ir, t, err)
    if (t.stat) return produceStatIem(ir, t)
    if (t.upload) return produceUploadItem(ir, t)
    if (t.restlist) return produceRestTable(ir, t);
    return <React.Fragment>
        {t.divider ? makeDivider(t.divider, { r: {} }) : undefined}
        {produceFormItem(ir, t, err, name)}
    </React.Fragment>

}

type SearchDialogProps = TField & {
    visible: boolean
    name?: number
    groupT?: TField
    addpars?: TRow
}

type MultiSelectProps = TField & {
    visible: boolean
    addpars?: TRow
}


const emptySearch = { field: "", visible: false }


// getValues: used only to get values for field list
// setInitValues: used to pass values set during jsinitvals (JSON)
// restapiinitname: the name is passed only to useEffect to be raised only once
// if definitvars is used in the userEffect, it is raised once per every rendering and overwrites variables
const ModalFormView = forwardRef<IRefCall, TFormView & { restapiinitname?: string, definitvars?: TRow, err: ErrorMessages, onValuesChanges: FOnValuesChanged, onFieldChange: FOnFieldChanged, aRest: TAsyncRestCall, getValues: FGetValues, setInitValues: FSetValues }>((props, ref) => {

    const [searchD, setSearchT] = useState<SearchDialogProps>(emptySearch);
    const [multiselectD, setMultiSelectD] = useState<MultiSelectProps>(emptySearch);
    const [fileupload, setFileUpload] = useState<UploadStore>(new Map())
    const fchanges = useRef<TFieldChange>({ fieldchange: new Set<string>(), notescalatewhenchange: new Set<string>() });
    const [multiselect, setMultiSelect] = useState<TMultiSelect>(new Map())
    const [tableR, setTableRefresh] = useState<TableRefresh>(new Map())
//    const [[f], setForm] = useState(Form.useForm())

    const [f]: [FormInstance] = Form.useForm()

//    console.log("f:------")
//    console.log(f)
//    const x = f.getFieldsValue()
//    console.log(x)
//    console.log("-------------")


//    const [f]: [FormInstance] = Form.useForm()
    //const f: FormInstance = Form.useFormInstance()

    const onFinish = (values: TRow) => {
        ltrace('Success, data validated')
        props.buttonClicked(transformValuesFrom(values, props.list))
    };

    const getVals = (): TRow => {
        const r: TRow = f.getFieldsValue()

        // extract uploads
        const uuid = getSessionId()
        for (let [id, list] of fileupload) {
            const l: string[] = list.map(e => uuid + "/" + e.name)
            r[id] = l
        }

        // multichoice
        for (let [id, mselect] of multiselect) {
            r[id] = mselect
        }

        return transformValuesFrom(r, props.list)
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
            // commented out 2022/08/14            
            //            f.setFieldsValue(vals);
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

    }, [props.initvals])


    // 2022/06/22 - jsrestapi after initvals, order is important
    useEffect(() => {
        // 2022/06/22 - ignore
        if (istrue(props.ignorerestapivals)) {
            if (props.jsrestapivals) ltrace("Ignore jsrestapivals for the second time")
            return;
        }
        if (props.jsrestapivals) {
            var initvals: TRow = callJSFunction(props.jsrestapivals as string, { r: {}, vars: props.vars as TRow });
            ltrace("useEffect jsrestapivals")
            console.log(initvals)
            const vals = transformValuesTo(initvals, props.list);
            f.setFieldsValue(vals)
            props.setInitValues(initvals)
            ltrace("useEffect jsrestapivals transformed")
            console.log(vals)
        }

    }, [props.jsrestapivals])

    // 2022/06/28 
    //definitvars: used restapiinitname to be raised only once
    useEffect(() => {
        // 2022/06/22 - ignore
        if (props.definitvars) {
            props.setInitValues(props.definitvars)
        }

    }, [props.restapiinitname])


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

    const closeMultiD: FAction = (b?: ButtonElem, r?: TRow) => {
        if (b?.choosefield === undefined) {
            setMultiSelectD(emptySearch)
            return;
        }
        const sel: FieldValue[] = (r as TRow)[defaults.multichoicevar] as FieldValue[]
        const s = new Map(multiselect)
        s.set(multiselectD.field, sel);
        setMultiSelect(s);
        props.onFieldChange(multiselectD.field)
        setMultiSelectD(emptySearch)
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
        const x: TRow = f.getFieldsValue()
        if (searchD.name === undefined) x[searchD.field] = val
        else {
            // list
            const a: TRow[] = (x[searchD.groupT ? searchD.groupT.field : searchD.field] as any)
            const elem: TRow = a[searchD.name]
            elem[searchD.field] = val
        }
        f.setFieldsValue(x)
        props.onFieldChange(searchD.field)
    }

    // ===================

    //const initvals = {paramsrequired: "aaa"}
    const initvals = { ...commonVars(), ...(props.initvals ? transformValuesTo(props.initvals as TRow, props.list) : undefined) }

    //ltrace("initvals")
    //console.log(initvals)

    const onFieldsChanges = (changedFields: Record<string, any>, _: any) => {
        if (isEmpty(changedFields)) return
        const id: string = changedFields[0]["name"][0]
        log(id + " changed")
        // if field is not triggered when blurred, escalates immediately
        if (!fchanges.current.notescalatewhenchange.has(id)) props.onFieldChange(id)
        else fchanges.current.fieldchange.add(id)
    }

    const fieldContext: IFieldContext = {
        getChanges: function (): TFieldChange {
            return fchanges.current;
        },
        fieldChanged: function (id: string): void {
            props.onFieldChange(id);
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
            return multiselect
        }
    }

    // must be preserve=true (default)
    ltrace(`Render`)
    const form = <Form
        form={f} onFinish={onFinish} onValuesChange={props.onValuesChanges} preserve={false}
        layout="horizontal" scrollToFirstError {...props.formprops} onFieldsChange={onFieldsChanges} >

        {buttonstop}

        {props.fields.map(e => produceItem(fieldContext, { ...e, searchF: searchF, multiF: multiF, tableR: tableR }, props.err))}

        {buttonsbottom}

    </Form>

    const header: ReactNode | undefined = props.header ?
        <HeaderTable {...props.header} refreshaction={() => { }} fbutton={closeF} r={{}} selectedM={[]} ></HeaderTable> :
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


