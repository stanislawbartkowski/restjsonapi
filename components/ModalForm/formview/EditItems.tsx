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
    FormListFieldData,
    AutoComplete,
    Segmented,
    Tooltip,
    Flex,
} from 'antd';

import type { ValidateStatus } from 'antd/lib/form/FormItem';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { RadioChangeEvent } from 'antd/lib';

import { PropsType, FIELDTYPE, FieldValue, FieldDefaults, TRow, RowData } from '../../../ts/typing';
import { decomposeEditId, emptys, getValue, isEditList, isItemGroup, istrue } from '../../ts/helper';
import { ButtonAction, TAutoCompleteMap, TField, TOptionLine, TRadioCheckItem, ValidatorType } from '../../ts/typing';
import { IFieldContext, FField, TFieldChange } from './types';
import { makeMessage } from '../../../ts/j';
import { HTMLElem, fieldType, fieldTitle, makeDivider } from '../../ts/transcol';
import { transformSingleValue } from '../../ts/transformres';
import { findErrField, getFieldProps, itemName } from './helper';
import { createItemList } from './CreateDisplayList';
import { createList } from './DialogListItem';
import { produceRestTable } from './DialogRestTable';
import { produceEditTable } from './EditTable';
import { produceStatIem } from './StatItem';
import { produceUploadItem } from './UploadItem';
import produceMultiChoiceButton from './MultiChoiceButton';
import { createRules } from './createRules';
import { findLabel } from '../../../ts/readresource';
import constructButton from '../../ts/constructbutton';
import { createCollapsePanels } from './CollapseItems';
import { createTabsPanel } from './TabItems';
import { SearchProps } from 'antd/es/input';
import lstring from '../../../ts/localize';
import defaults from '../../../ts/defaults';

const { RangePicker } = DatePicker;

export type ErrorMessage = {
    field: string,
    message: string
}

export type ErrorMessages = ErrorMessage[]

//type OkValidated = () => void

//export interface IRefCall {
//    validate: ( ok : OkValidated ) => void
//    getValues: FGetValues
//    refreshTable: (field: string) => void
//}


export function placeHolder(t: TField) {
    if (t.placeholder) {
        const placeH: string = makeMessage(t.placeholder) as string
        return { placeholder: placeH }
    }
    return undefined;
}

export type elemFactory = (t: TField, e: elemFactory) => ReactNode

// -------- radio

function combineProps(p1?: PropsType, p2?: PropsType): PropsType {
    if (p1 === undefined) return { ...p2 }
    if (p2 === undefined) return { ...p1 }
    const style = {
        ...p1.style,
        ...p2.style
    }
    return { ...p1, ...p2, style: style }
}

function createRadioItem(e: TRadioCheckItem, button?: boolean, props?: PropsType): ReactNode {

    if (button) {
        //        const p: PropsType = { ...props, ...e.props }
        const p: PropsType = combineProps(props, e.props)
        return <Radio.Button value={e.value}  {...p}> {itemName(e)} </Radio.Button >
    }
    return <Radio value={e.value} {...e.props}>{itemName(e)}</Radio>

}

function createProps(ir: IFieldContext, t: TField) {
    const lprops = { ...prepareStyleByLabel(t) }
    //    const props = t.iprops ? { ...lprops, ...t.iprops } : lprops
    const props = combineProps(lprops, t.iprops)
    if (t.disabled) {
        props["disabled"] = true
    }
    const aprops: TField | undefined = getFieldProps(ir, t) as TField
    if (aprops === undefined) return props
    if (aprops.disabled === undefined) return props
    props["disabled"] = aprops.disabled
    return props
}

function createRadioGroup(ir: IFieldContext, t: FField): ReactNode {

    function onChange(e: RadioChangeEvent) {
        ir.fieldChanged(t)
    }

    return <Radio.Group {...createProps(ir, t)} onChange={onChange}>
        {
            (t.radio?.items as TRadioCheckItem[]).map(e => createRadioItem(e, t.radio?.button, t.radio?.props))
        }

    </Radio.Group>
}


function createSegmentOption(t: TRadioCheckItem) {
    const labstring = makeMessage(t.label)
    const lsubstring = t.sublabel === undefined ? undefined : makeMessage(t.sublabel)
    const label = lsubstring === undefined ? labstring : <div>{labstring}<br />{lsubstring}</div>
    return {
        label: label,
        value: t.value
    }

}

function createSegmented(ir: IFieldContext, t: FField): ReactNode {

    //function onChange(value: string | number) {
        // 2023/12/26 - nadmiarowe
        //ir.fieldChanged(t)
    //}

    const items: TRadioCheckItem[] = t.radio?.items as TRadioCheckItem[]
    const options = items.map(e => createSegmentOption(e))
    return <Segmented {...t.props} options={options}></Segmented>
}

function isNotRequired(t: TField): boolean {
    if (t.validate === undefined) return true;
    const v: ValidatorType | undefined = t.validate.find(t => t.required)
    return v === undefined || v.required === undefined || !v.required
}

function createSelectGroup(ir: IFieldContext, t: FField, items: TRadioCheckItem[], multi: boolean): ReactNode {

    const clear: SelectProps = isNotRequired(t) ? { allowClear: true } : { allowClear: false }
    const p: SelectProps = multi ? { mode: "multiple" } : {}

    function onChange(e: RadioChangeEvent) {
        ir.fieldChanged(t)
    }

    return <Select {...p} {...clear} {...createProps(ir, t)} {...placeHolder(t)} onChange={onChange}>
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

function changetoMoney(val: string): string {
    return val.replace(',', '.')
}

function onTextInput(c: React.FocusEvent, t: TField) {

    const inputVal: string = (fieldType(t) === FIELDTYPE.MONEY) ?
        changetoMoney((c.target as HTMLInputElement).value) :
        (c.target as HTMLInputElement).value


    if (t.toupper) (c.target as HTMLInputElement).value = inputVal.toUpperCase()
    else
        if (t.tolower) (c.target as HTMLInputElement).value = inputVal.toLowerCase()
        else (c.target as HTMLInputElement).value = inputVal

}

function curryOnInput(t: TField) {
    const onInput: FocusEventHandler<HTMLInputElement> = (c: React.FocusEvent) => {
        onTextInput(c, t)
    }
    return onInput
}

function curryOnTextAreaInput(t: TField) {
    const onInput: FocusEventHandler<HTMLTextAreaElement> = (c: React.FocusEvent) => {
        onTextInput(c, t)
    }
    return onInput
}


function searchItem(ir: IFieldContext, t: FField, listfield?: FormListFieldData): React.ReactNode {

    const onBlur: FocusEventHandler<HTMLInputElement> = (c: React.FocusEvent) => {
        const id: string = c.target.id
        checkchange(ir, c.target.id, t)
    }

    const onSearchButton: SearchProps['onSearch'] = (value: string, event: any) => {
        if (event.type === "keydown") return
        t.searchF(value, { ...t, listfield: listfield });
    }

    return <Input.Search onInput={curryOnInput(t)} onBlur={onBlur} {...placeHolder(t)}  {...createProps(ir, t)}  {...enterButton(t)} onSearch={onSearchButton} />
}

// ===========================================

interface HTMLProps {
    value?: string
    onChange?: (value: string) => void
}

const convertElem = (val: string | undefined) => {
    if (emptys(val)) return undefined

    const re = new RegExp("\\$\\([^)]+\\)", "g")
    const ma = val?.match(re)
    if (ma === undefined) return val
    var destv = val
    ma?.forEach(e => {
        var key = e.substring(2, e.length - 1)
        var label = lstring(key)
        if (!emptys(label)) {
            destv = destv?.replace(e, label)
        }
    })

    return destv

}

const HTMLControl: React.FC<HTMLProps> = (props) => {
    return HTMLElem(convertElem(props.value));
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

    //const fId: string = t.genId !== undefined ? t.genId(t.field) : t.field

    const onBlur: FocusEventHandler<HTMLElement> = (c: React.FocusEvent) => {
        const id: string = c.target.id
        checkchange(ir, c.target.id, t)
    }

    const onBlurTextArea: FocusEventHandler<HTMLTextAreaElement> = (c: React.FocusEvent) => {
        const id: string = c.target.id
        checkchange(ir, c.target.id, t)
    }

    if (isItemGroup(t)) {
        return [<React.Fragment>
            {(t.items as TField[]).map(e => produceItem(ir, {
                ...e, field: t.genId !== undefined ? t.genId(e.field) : e.field, genId: t.genId, searchF: t.searchF, groupT: t, multiF: t.multiF,
                tableR: t.tableR, setinitvarsaction: t.setinitvarsaction, setvarsaction: t.setvarsaction, seteditRow: t.seteditRow,
                rerenderD: t.rerenderD, options: t.options
            }, err, field))}
        </React.Fragment>,
            undefined]
    }

    if (t.radio) {
        if (t.radio.select) return [createSelectGroup(ir, t, t.radio.items as TRadioCheckItem[], false), undefined]
        if (t.radio.segmented) return [createSegmented(ir, t), undefined]
        return [createRadioGroup(ir, t), undefined]
    }

    if (t.checkbox)
        if (t.checkbox.select) return [createSelectGroup(ir, t, t.checkbox.items as TRadioCheckItem[], true), undefined]
        else return [createCheckBoxGroup(t), undefined]

    const fieldtype: FIELDTYPE = fieldType(t)
    const iprops = createProps(ir, t)

    // except boolean/switch - change reported when blurred
    if (fieldtype !== FIELDTYPE.BOOLEAN && fieldtype !== FIELDTYPE.DATE) ir.getChanges().notescalatewhenchange.add(t.field)

    let valuep = {}
    let disabledp = {}


    // set value here only for boolean
    if (t.value) {
        const vars: TRow = {}
        vars[defaults.currentfield] = t.field
        const value: FieldValue = getValue(t.value, { r: ir.getValues(), vars: vars });
        const v = transformSingleValue(value, t, false);
        valuep = fieldtype === FIELDTYPE.BOOLEAN ? (v as boolean) ? { initialValue: "checked" } : {} : {}
        if (fieldtype !== FIELDTYPE.HTML) disabledp = { disabled: true }
    }

    function isenabled(ipros: PropsType): boolean {
        if (ipros === undefined) return true
        const disabled = iprops["disabled"]
        return !istrue(disabled)
    }

    switch (fieldtype) {
        case FIELDTYPE.NUMBER: return [<InputNumber onBlur={onBlur} {...placeHolder(t)} {...iprops} {...disabledp} />, { ...valuep }]
        case FIELDTYPE.DATE:
            if (t.range) return [<RangePicker onBlur={onBlur} {...iprops} />, undefined]
            return [<DatePicker {...placeHolder(t)} {...iprops} {...disabledp} />, { ...valuep }]
        case FIELDTYPE.BOOLEAN: return [<Switch {...iprops}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            {...disabledp}
        />, { valuePropName: "checked", ...valuep }
        ]
        case FIELDTYPE.HTML: return [<HTMLControl />, { ...valuep }]
    }

    const fieldE: ReactNode = t.enterbutton && isenabled(iprops) ? searchItem(ir, t, field) :
        t.istextarea ? <Input.TextArea onInput={curryOnTextAreaInput(t)} onBlur={onBlurTextArea} {...placeHolder(t)}  {...iprops} {...disabledp} />
            : <Input onInput={curryOnInput(t)} onBlur={onBlur} {...placeHolder(t)}  {...iprops} {...disabledp} />


    if (t.autocomplete && isenabled(iprops)) {

        const aoptions: TOptionLine[] | undefined = t.autocomplete === undefined ? [] : t.options?.get(t.autocomplete)

        const onSelect = (value: string) => {
            console.log('onSelect', value);
        };

        return [<AutoComplete
            options={aoptions}
            onSelect={onSelect}
            onSearch={(value: string) => ir.fGetOptions(t, value)}
        >
            {fieldE}
        </AutoComplete>, { ...valuep }]
    }

    return [fieldE, { ...valuep }]
}

function errorMessage(t: FField, err: ErrorMessages): {} | { validateStatus: ValidateStatus, help: string[] } {
    const e: ErrorMessage | undefined = findErrField(t.field, err)
    if (e === undefined) return {}
    return { validateStatus: 'error', help: [e.message] }
}

function prepareStyleByLabel(t: TField): PropsType | undefined {
    if (t.label == undefined) return
    const d: FieldDefaults | undefined = findLabel(t.label)
    if (d === undefined || d.width === undefined) return undefined
    const css: React.CSSProperties = { width: d.width }
    return {
        style: css
    }
}

function produceButton(ir: IFieldContext, t: FField, err: ErrorMessages, field?: FormListFieldData): React.ReactNode {

    return constructButton(t.button as ButtonAction, ir.clickButton)

}

export function produceFormItem(ir: IFieldContext, t: FField, err: ErrorMessages, listfield?: FormListFieldData): React.ReactNode {

    if (t.fieldtype === FIELDTYPE.NOFIELD) return undefined

    const row: TRow = ir.getValues()
    const mess: string = fieldTitle(t, { r: row, vars: { field: t.field } });

    const [rules, required] = createRules(ir, t, mess)
    const props: PropsType = { ...t.props }
    if (props.rules && rules) {
        props.rules = rules.concat(props.rules)
    }
    else if (rules) props.rules = rules

    // checked for boolean and not radio (important)
    const addprops = (t.fieldtype === FIELDTYPE.BOOLEAN && t.radio === undefined) ? { valuePropName: "checked" } : undefined

    const elemp = produceElem(ir, t, err, listfield)

    const requiredprops = required ? { required: true } : undefined

    //const fId: string = t.genId !== undefined ? t.genId(t.field) : t.field
    const fId: string = t.field

    const nameT = listfield === undefined ? { name: fId } : { name: [listfield.name, fId] }

    const edititem = <Form.Item {...props} {...nameT} id={fId} key={fId} {...requiredprops} label={mess} {...errorMessage(t, err)} {...addprops} {...elemp[1]} >
        {elemp[0]}
    </Form.Item>


    let tooltiptitle: string | undefined = undefined
    let tooltipprops: PropsType | undefined = undefined

    const getEditValue = (row: TRow): FieldValue => {
        const edittable: [string, string, number] | undefined = decomposeEditId(t.field)
        if (edittable === undefined) return row[t.field]
        const table: RowData = row[edittable[0]] as RowData
        // 2024/07/06 - can be complex id and no table related
        if (table === undefined) return row[t.field]
        const mrow: TRow = table[edittable[2]]
        return mrow[edittable[1]]
    }

    if (t.tooltip) {
        const auto: TAutoCompleteMap | undefined = ir.fGetAutocomplete()
        const vars: TRow = {}
        tooltipprops = t.tooltip.props
        if (auto)
            auto.forEach((value: RowData, key: string) => {
                const k = defaults.autocompleteprefix + key
                vars[k] = value
            });
        vars[defaults.currentfield] = t.field
        //const edittable: [string, string, number] | undefined = decomposeEditId(t.field)
        vars[defaults.currentvalue] = getEditValue(row)
        tooltiptitle = makeMessage(t.tooltip, { r: row, vars: vars })
    }

    const formedititem = tooltiptitle ? <Tooltip {...tooltipprops} fresh destroyTooltipOnHide title={tooltiptitle}>{edititem}</Tooltip> : edititem

    return formedititem

}

export function produceItem(ir: IFieldContext, t: FField, err: ErrorMessages, name?: FormListFieldData, eFactory?: elemFactory): ReactNode {

    if (t.multichoice) return produceMultiChoiceButton(ir, t, err)
    if (t.itemlist) return createItemList(ir, t, err);
    if (t.list) return createList(ir, t, err)
    if (t.stat) return produceStatIem(ir, t)
    if (t.upload) return produceUploadItem(ir, t)
    if (t.restlist) return produceRestTable(ir, t);
    if (isEditList(t)) return produceEditTable(ir, t, err);
    if (t.button) return produceButton(ir, t, err, name)
    if (t.collapse) return createCollapsePanels(ir, t, err, eFactory as elemFactory);
    if (t.tab) return createTabsPanel(ir, t, err, eFactory as elemFactory)
    return <React.Fragment>
        {t.divider ? makeDivider(t.divider, { r: {} }) : undefined}
        {produceFormItem(ir, t, err, name)}
        {t.bottomdivider ? makeDivider(t.bottomdivider, { r: {} }) : undefined}
    </React.Fragment>
}
