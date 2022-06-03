import React, { FocusEventHandler, forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';

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
    Card
} from 'antd';
import { FormInstance, Rule } from 'antd/es/form';
import type { ValidateStatus } from 'antd/lib/form/FormItem';
import { CloseOutlined, CheckOutlined, MinusCircleOutlined } from '@ant-design/icons';


import { TField, TForm, TRadioCheckItem } from '../ts/typing'
import { log, trace } from '../../ts/l'
import { ButtonElem, FAction, FIELDTYPE, FieldValue, PropsType, TRow } from '../../ts/typing'
import { fieldTitle, fieldType } from '../ts/transcol';
import { getButtonName, makeMessage } from '../../ts/j';
import getIcon from '../../ts/icons';
import lstring from '../../ts/localize';
import { FFieldElem, isItemGroup } from '../ts/helper';
import { transformValuesFrom, transformValuesTo } from '../ts/transformres';
import RestComponent from '../RestComponent';
import { cardProps } from '../ts/helper'

type FSearchAction = (s: string, t: FField) => void

type FField = TField & {

    searchF: FSearchAction
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

export type FOnValuesChanged = (changedFields: Record<string, any>, _: Record<string, any>) => void

export type FOnFieldChanged = (id: string) => void

function ltrace(mess: string) {
    trace('ModalFormView', mess)
}

export interface IRefCall {
    validate: () => void
    setValues: (row: TRow) => void
    getValues: () => TRow
}

interface IFieldContext {
    getChanges: () => TFieldChange
    fieldChanged: (id: string) => void
}

type TFormView = TForm & {
    buttonClicked: (row: TRow) => void
    buttonsextratop?: ReactNode
    buttonsextrabottom?: ReactNode
    initvals?: TRow
    list: FFieldElem[]
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

    return <Radio.Group {...t.props}>
        {
            (t.radio?.items as TRadioCheckItem[]).map(e => createRadioItem(e, t.radio?.button))
        }

    </Radio.Group>
}

function createSelectGroup(t: TField, items: TRadioCheckItem[], multi: boolean): ReactNode {

    const p: SelectProps = multi ? { mode: "multiple" } : {}

    return <Select {...p} {...t.props} {...placeHolder(t)} >
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

    const html: string = props.value ? props.value : ""
    return <div dangerouslySetInnerHTML={{ __html: html }} />
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
            {(t.items as TField[]).map(e => produceFormItem(ir, { ...e, searchF: t.searchF, groupT: t }, err, name))}
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

    switch (fieldtype) {
        case FIELDTYPE.NUMBER: return [<InputNumber onBlur={onBlur} {...placeHolder(t)} {...t.iprops} />, undefined]
        case FIELDTYPE.DATE:
            if (t.range) return [<RangePicker {...t.iprops} />, undefined]
            return [<DatePicker  {...t.iprops} />, undefined]
        case FIELDTYPE.BOOLEAN: return [<Switch {...t.iprops}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
        />, { valuePropName: "checked" }
        ]
        case FIELDTYPE.HTML: return [<HTMLControl />, undefined]
    }

    return t.enterbutton ? [searchItem(ir, t, name), undefined] :
        [<Input onBlur={onBlur} {...placeHolder(t)}  {...t.iprops} />, undefined]
}

export function findErrField(field: string, err: ErrorMessages): ErrorMessage | undefined {
    return err.find(e => e.field === field)
}

function errorMessage(t: FField, err: ErrorMessages): {} | { validateStatus: ValidateStatus, help: string[] } {
    const e: ErrorMessage | undefined = findErrField(t.field, err)
    if (e === undefined) return {}
    return { validateStatus: 'error', help: [e.message] }
}

function createRules(t: FField): [Rule[] | undefined, boolean] {

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
        })

    return [rules.length === 0 ? undefined : rules, required]

}


function produceFormItem(ir: IFieldContext, t: FField, err: ErrorMessages, name?: number): React.ReactNode {

    const [rules, required] = createRules(t)
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


function produceItem(ir: IFieldContext, t: FField, err: ErrorMessages): React.ReactNode {

    if (t.list) return createList(ir, t, err)
    return produceFormItem(ir, t, err)

}

type SearchDialogProps = TField & {
    visible: boolean
    name?: number
    groupT?: TField
}

const emptySearch = { field: "", visible: false }

const ModalFormView = forwardRef<IRefCall, TFormView & { err: ErrorMessages, onValuesChanges: FOnValuesChanged, onFieldChange: FOnFieldChanged }>((props, ref) => {

    const [searchD, setSearchT] = useState<SearchDialogProps>(emptySearch);
    const fchanges = useRef<TFieldChange>({ fieldchange: new Set<string>(), notescalatewhenchange: new Set<string>() });

    const [f]: [FormInstance] = Form.useForm()

    const onFinish = (values: TRow) => {
        ltrace('Success, data validated')
        props.buttonClicked(transformValuesFrom(values, props.list))
    };

    const getVals = (): TRow => {
        const r: TRow = f.getFieldsValue()
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
        setValues: (row: TRow) => {
            const r: TRow = getVals();
            const newr: TRow = { ...r, ...row }
            f.setFieldsValue(transformValuesTo(newr, props.list))
        },
    }));

    useEffect(() => {

        console.log(props.initvals)
        if (props.initvals) f.setFieldsValue(transformValuesTo(props.initvals, props.list));

    }, [props.initvals])

    const buttonstop: ReactNode = props.buttonsextratop ? <React.Fragment><Form.Item><Space>{props.buttonsextratop}</Space></Form.Item><Divider /></React.Fragment> : undefined
    const buttonsbottom: ReactNode = props.buttonsextrabottom ? <React.Fragment><Divider /><Form.Item><Space>{props.buttonsextrabottom}</Space></Form.Item></React.Fragment> : undefined

    // ==================

    const searchF: FSearchAction = (s: string, t: FField) => {
        setSearchT({ ...t, visible: true })
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
    const initvals = props.initvals ? transformValuesTo(props.initvals as TRow, props.list) : undefined

    console.log(initvals)

    const onFieldsChanges = (changedFields: Record<string, any>, _: any) => {
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
            console.log(id + " change escalated")
            props.onFieldChange(id)
        }
    }

    const form = <Form
        form={f} onFinish={onFinish} onValuesChange={props.onValuesChanges} preserve={false}
        layout="horizontal" scrollToFirstError {...props.formprops} onFieldsChange={onFieldsChanges} >

        {buttonstop}

        {props.fields.map(e => produceItem(fieldContext, { ...e, searchF: searchF }, props.err))}

        {buttonsbottom}

    </Form>


    return <React.Fragment>
        {form}
        <RestComponent  {...searchD.enterbutton} visible={searchD.visible} choosing closeAction={closeF} />
    </React.Fragment>
})

export default ModalFormView
