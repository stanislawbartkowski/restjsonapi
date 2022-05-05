import React, { forwardRef, ReactNode, useImperativeHandle } from 'react';

import {
    Form,
    Input,
    DatePicker,
    InputNumber,
    Space,
    Divider,
    Switch
} from 'antd';
import { FormInstance } from 'antd/es/form';
import type { ValidateStatus } from 'antd/lib/form/FormItem';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';


import { TField, TForm } from '../ts/typing'
import { trace } from '../../ts/l'
import { FIELDTYPE, FieldValue, TRow } from '../../ts/typing'
import { fieldTitle, fieldType } from '../ts/transcol';
import { dateremoveT } from '../../ts/d'

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

function produceElem(t: TField): React.ReactNode {
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

function produceItem(t: TField, err: ErrorMessages): React.ReactNode {

    const mess: string = fieldTitle(t, { r: {} });
    return <Form.Item {...t.props} id={t.field} name={t.field} key={t.field} label={mess} {...errorMessage(t, err)}>
        {produceElem(t)}
    </Form.Item>
}

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