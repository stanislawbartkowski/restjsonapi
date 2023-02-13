import React, { FocusEventHandler, ReactNode } from 'react';

import {
    Form,
    Input,
    DatePicker,
    InputNumber,
    Switch,
    Radio,
    Checkbox,
    Select,
    SelectProps,
    FormListFieldData
} from 'antd';

import type { ValidateStatus } from 'antd/lib/form/FormItem';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

import { PropsType, FIELDTYPE, FieldValue } from '../../../ts/typing';
import { getValue, isEditList, isItemGroup, tomoney } from '../../ts/helper';
import { FGetValues, TField, TRadioCheckItem, ValidatorType } from '../../ts/typing';
import { IFieldContext, FField, TFieldChange } from './types';
import { makeMessage } from '../../../ts/j';
import { log } from '../../../ts/l';
import { HTMLElem, fieldType, fieldTitle, makeDivider } from '../../ts/transcol';
import { transformSingleValue } from '../../ts/transformres';
import { findErrField, itemName } from './helper';
import { createItemList } from './CreateDisplayList';
import { createList } from './DialogListItem';
import { produceRestTable } from './DialogRestTable';
import { produceEditTable } from './EditTable';
import { produceStatIem } from './StatItem';
import { produceUploadItem } from './UploadItem';
import { produceMultiChoiceButton } from './MultiChoiceButton';
import { createRules } from './createRules';

const { RangePicker } = DatePicker;

export type ErrorMessage = {
    field: string,
    message: string
}

export type ErrorMessages = ErrorMessage[]


export interface IRefCall {
    validate: () => void
    getValues: FGetValues
    refreshTable: (field: string) => void
}


export function placeHolder(t: TField) {
    if (t.placeholder) {
        const placeH: string = makeMessage(t.placeholder) as string
        return { placeholder: placeH }
    }
    return undefined;
}

// -------- radio

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

function curryOnInput(t: TField) {
    const onInput: FocusEventHandler<HTMLInputElement> = (c: React.FocusEvent) => {
        if (t.toupper) (c.target as HTMLInputElement).value = (c.target as HTMLInputElement).value.toUpperCase()
        if (t.tolower) (c.target as HTMLInputElement).value = (c.target as HTMLInputElement).value.toLowerCase()
    }
    return onInput
}


function searchItem(ir: IFieldContext, t: FField, listfield?: FormListFieldData): React.ReactNode {

    const onBlur: FocusEventHandler<HTMLInputElement> = (c: React.FocusEvent) => {
        const id: string = c.target.id
        log(id + " on blur")
        checkchange(ir, c.target.id, t)
    }

    function onSearchButton(value: string) {
        t.searchF(value, { ...t, listfield: listfield });
    }

    return <Input.Search onInput={curryOnInput(t)} onBlur={onBlur} {...placeHolder(t)}  {...t.iprops}  {...enterButton(t)} onSearch={onSearchButton} />
}

// ===========================================

interface HTMLProps {
    value?: string
    onChange?: (value: string) => void
}

const HTMLControl: React.FC<HTMLProps> = (props) => {
    return HTMLElem(props.value);
}

function checkchange(ir: IFieldContext, id: string, t: FField) {

    const ch: TFieldChange = ir.getChanges()
    const exist: boolean = ch.fieldchange.has(id)
    if (exist) {
        ch.fieldchange.delete(id)
        //ir.fieldChanged(id)
        ir.fieldChanged(t)
    }

}

function produceElem(ir: IFieldContext, t: FField, err: ErrorMessages, field?: FormListFieldData): [React.ReactNode, PropsType | undefined] {

    const onBlur: FocusEventHandler<HTMLInputElement> = (c: React.FocusEvent) => {
        const id: string = c.target.id
        log(id + " on blur")
        checkchange(ir, c.target.id, t)
    }

    if (isItemGroup(t)) {
        return [<React.Fragment>
            {(t.items as TField[]).map(e => produceItem(ir, { ...e, searchF: t.searchF, groupT: t, multiF: t.multiF, tableR: t.tableR, setvarsaction: t.setvarsaction, seteditRow: t.seteditRow, rerenderD: t.rerenderD }, err, field))}
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
            if (t.range) return [<RangePicker onBlur={onBlur} {...t.iprops} />, undefined]
            return [<DatePicker {...placeHolder(t)} {...t.iprops} {...disabledp} />, { ...valuep }]
        case FIELDTYPE.BOOLEAN: return [<Switch {...t.iprops}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            {...disabledp}
        />, { valuePropName: "checked", ...valuep }
        ]
        case FIELDTYPE.HTML: return [<HTMLControl />, { ...valuep }]
    }

    return t.enterbutton ? [searchItem(ir, t, field), undefined] :
        [<Input onInput={curryOnInput(t)} onBlur={onBlur} {...placeHolder(t)}  {...t.iprops} {...disabledp} />, { ...valuep }]
}

function errorMessage(t: FField, err: ErrorMessages): {} | { validateStatus: ValidateStatus, help: string[] } {
    const e: ErrorMessage | undefined = findErrField(t.field, err)
    if (e === undefined) return {}
    return { validateStatus: 'error', help: [e.message] }
}

export function produceFormItem(ir: IFieldContext, t: FField, err: ErrorMessages, listfield?: FormListFieldData): React.ReactNode {

    const [rules, required] = createRules(ir, t)
    const props = { ...t.props }
    if (props.rules && rules) {
        props.rules = rules.concat(props.rules)
    }
    else if (rules) props.rules = rules

    // checked for boolean and not radio (important)
    const addprops = (t.fieldtype === FIELDTYPE.BOOLEAN && t.radio === undefined) ? { valuePropName: "checked" } : undefined

    const elemp = produceElem(ir, t, err, listfield)

    const requiredprops = required ? { required: true } : undefined


    const mess: string = fieldTitle(t, { r: {} });

    const nameT = listfield === undefined ? { name: t.field } : { name: [listfield.name, t.field] }

    return <Form.Item {...props} {...nameT} id={t.field} key={t.field} {...requiredprops} label={mess} {...errorMessage(t, err)} {...addprops} {...elemp[1]} >
        {elemp[0]}
    </Form.Item>

}


export function produceItem(ir: IFieldContext, t: FField, err: ErrorMessages, name?: FormListFieldData): ReactNode {

    if (t.multichoice) return produceMultiChoiceButton(ir, t)
    if (t.itemlist) return createItemList(ir, t, err);
    if (t.list) return createList(ir, t, err)
    if (t.stat) return produceStatIem(ir, t)
    if (t.upload) return produceUploadItem(ir, t)
    if (t.restlist) return produceRestTable(ir, t);
    if (isEditList(t)) return produceEditTable(ir, t, err);
    return <React.Fragment>
        {t.divider ? makeDivider(t.divider, { r: {} }) : undefined}
        {produceFormItem(ir, t, err, name)}
    </React.Fragment>

}