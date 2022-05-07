import React, { forwardRef, ReactNode, useImperativeHandle } from 'react';

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
import { FormInstance } from 'antd/es/form';
import type { ValidateStatus } from 'antd/lib/form/FormItem';
import { CloseOutlined, CheckOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';


import { TField, TForm, TRadioItem } from '../ts/typing'
import { trace } from '../../ts/l'
import { ButtonElem, FIELDTYPE, FieldValue, PropsType, TRow } from '../../ts/typing'
import { fieldTitle, fieldType } from '../ts/transcol';
import { dateremoveT } from '../../ts/d'
import { getButtonName, makeMessage } from '../../ts/j';
import getIcon from '../../ts/icons';

export type ErrorMessage = {
    field: string,
    message: string
}

export type ErrorMessages = ErrorMessage[]

export type FOnValuesChanged = (changedFields: Record<string, any>, _: Record<string, any>) => void

function ltrace(mess: string) {
    trace('ModalFormView', mess)
}

export interface IRefCall {
    validate: () => void
    setValue: (field: string, value: FieldValue) => void
    scrollFocus: (field: string) => void
    getValues: () => TRow
}

type TFormView = TForm & {
    buttonClicked: (row: TRow) => void
    buttonsextra?: ReactNode
    initvals?: TRow
}

// -------- radio

function itemName(e: TRadioItem): string | undefined {
    return makeMessage(e.label, { r: {} })
}

function createRadioItem(e: TRadioItem, button?: boolean): ReactNode {

    if (button) return <Radio.Button value={e.value} {...e.props}>{itemName(e)}</Radio.Button>
    return <Radio value={e.value} {...e.props}>{itemName(e)}</Radio>

}

function createRadioGroup(t: TField): ReactNode {

    return <Radio.Group {...t.props}>
        {
            t.radio?.items.map(e => createRadioItem(e, t.radio?.button))
        }

    </Radio.Group>
}

function createSelectGroup(t: TField, items: TRadioItem[], multi: boolean): ReactNode {

    const p: SelectProps = multi ? { mode: "multiple" } : {}

    return <Select {...p} {...t.props}>
        {
            items.map(e => <Select.Option value={e.value} {...e.props}>{itemName(e)}</Select.Option>)
        }
    </Select>

}

//  ---- checkbox

function createCheckBoxGroup(t: TField): ReactNode {
    return <Checkbox.Group {...t.props}>
        {
            t.checkbox?.items.map(e => <Checkbox value={e.value} {...e.props}> {itemName(e)} </Checkbox>)
        }

    </Checkbox.Group>
}


function produceElem(t: TField): React.ReactNode {

    if (t.radio)
        if (t.radio.select) return createSelectGroup(t, t.radio.items, false)
        else return createRadioGroup(t)

    if (t.checkbox)
        if (t.checkbox.select) return createSelectGroup(t, t.checkbox.items, true)
        else return createCheckBoxGroup(t);

    const fieldtype: FIELDTYPE = fieldType(t)
    switch (fieldtype) {
        case FIELDTYPE.NUMBER: return <InputNumber {...t.iprops} />
        case FIELDTYPE.DATE: return <DatePicker {...t.iprops} />
        case FIELDTYPE.BOOLEAN: return <Switch {...t.iprops}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
        />
    }
    return <Input {...t.iprops} />
}

export function findErrField(field: string, err: ErrorMessages): ErrorMessage | undefined {
    return err.find(e => e.field === field)
}

function errorMessage(t: TField, err: ErrorMessages): {} | { validateStatus: ValidateStatus, help: string[] } {
    const e: ErrorMessage | undefined = findErrField(t.field, err)
    if (e === undefined) return {}
    return { validateStatus: 'error', help: [e.message] }
}

function produceFormItem(t: TField, err: ErrorMessages, name?: number): React.ReactNode {

    const mess: string = fieldTitle(t, { r: {} });
    return <Form.Item {...t.props} id={t.field} name={name !== undefined ? [name, t.field] : t.field} key={t.field} label={mess} {...errorMessage(t, err)}>
        {produceElem(t)}
    </Form.Item>
}

// ================================
// list item
// ================================


function createList(t: TField, err: ErrorMessages): ReactNode {

    const addButton: ButtonElem = t.list?.addbutton as ButtonElem

    const plusicon: ReactNode = getIcon(addButton.icon ? addButton.icon : 'plusoutlined');

    const addname = getButtonName(addButton)

    const title = t.list?.card?.title ? { title : makeMessage(t.list.card.title, {r:{}})} : {}
    const cardprops = t.list?.card?.props ? {...t.list.card.props} : undefined


    return <Card bordered {...title} {...cardprops}><Form.List name={t.field} key={t.field} {...t.list?.props} >
        {(fields, { add, remove }) => (
            <>
                {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        {produceFormItem(t, err, name)}
                        <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                ))}
                <Form.Item>
                    <Button type="dashed"  onClick={() => add()} block {...addButton.props} icon={plusicon}>
                        {addname}
                    </Button>
                </Form.Item>
            </>
        )}

    </Form.List>
    </Card>
}


function produceItem(t: TField, err: ErrorMessages): React.ReactNode {

    if (t.list) return createList(t, err)
    return produceFormItem(t, err)

}


// =====================
// transform result
// =====================

function getValue(v: any, t: TField) {

    const tt: FIELDTYPE = fieldType(t);
    if (tt !== FIELDTYPE.DATE) return v;
    return dateremoveT(v)
}

function transformValues(row: TRow, tf: TField[]): TRow {
    const res: TRow = {}
    tf.forEach((t: TField) => {
        const fieldtype: FIELDTYPE = fieldType(t)
        if (row[t.field] !== undefined) {
            res[t.field] = getValue(row[t.field], t)
        } else
            // undefined for boolean is false
            if (fieldtype === FIELDTYPE.BOOLEAN) res[t.field] = false
    })
    return res;
}

const ModalFormView = forwardRef<IRefCall, TFormView & { err: ErrorMessages, onValuesChanges: FOnValuesChanged }>((props, ref) => {

    const [f]: [FormInstance] = Form.useForm()

    const onFinish = (values: TRow) => {
        ltrace('Success, data validated')
        props.buttonClicked(transformValues(values, props.fields))
    };

    useImperativeHandle(ref, () => ({
        getValues: () => {
            const r: TRow = f.getFieldsValue()
            return transformValues(r, props.fields)
        },
        validate: () => {
            ltrace('submit');
            f.submit()
        },
        setValue: (field: string, value: FieldValue) => {
            ltrace(`${field} value: ${value}`)
            f.setFields([
                {
                    name: field,
                    touched: false,
                    value: value
                },
            ]);

        },
        scrollFocus(field: string) {
            ltrace(`focus: ${field}`)
            f.scrollToField(field);
        }
    }));

    const buttons: ReactNode = props.buttonsextra ? <React.Fragment><Divider /><Form.Item><Space>{props.buttonsextra}</Space></Form.Item></React.Fragment> : undefined



    const form = <Form labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }} form={f} onFinish={onFinish} onValuesChange={props.onValuesChanges}
        layout="horizontal" scrollToFirstError {...props.formprops} initialValues={props.initvals}>


        {props.fields.map(e => produceItem(e, props.err))}

        {buttons}

    </Form>


    return form
})

export default ModalFormView
