import React, { forwardRef, useImperativeHandle } from 'react';

import {
    Form,
    Input,
    DatePicker,
    InputNumber,
    FormProps,
} from 'antd';

import { FormInstance } from 'antd/es/form';

import type { ValidateStatus } from 'antd/lib/form/FormItem';


import { FieldValue, TField, TForm, TRow } from '../typing'
import { trace } from '../../../ts/l'
import { FIELDTYPE } from '../../../ts/typing'

import { fieldTitle, fieldType } from '../js/helper';

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
    formprops?: FormProps
}

function produceElem(t: TField): React.ReactNode {
    const fieldtype: FIELDTYPE = fieldType(t)
    switch (fieldtype) {
        case FIELDTYPE.NUMBER: return <InputNumber {...t.iprops} />
        case FIELDTYPE.DATE: return <DatePicker />
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

    const mess: string = fieldTitle(t);
    return <Form.Item {...t.props} id={t.field} name={t.field} key={t.field} label={mess} {...errorMessage(t, err)}>
        {produceElem(t)}
    </Form.Item>
}

const ModalFormView = forwardRef<IRefCall, TFormView & { err: ErrorMessages, onValuesChanges: FOnValuesChanged }>((props, ref) => {

    const [f]: [FormInstance] = Form.useForm()

    const onFinish = (values: TRow) => {
        ltrace('Success, data validated')
        props.buttonClicked(values)
    };

    useImperativeHandle(ref, () => ({
        getValues: () => {
            const r: TRow = f.getFieldsValue()
            return r
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

    const form = <Form labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }} form={f} onFinish={onFinish} onValuesChange={props.onValuesChanges}
        layout="horizontal" scrollToFirstError {...props.formprops} >

        {props.fields.map(e => produceItem(e, props.err))}

    </Form>


    return form
})

export default ModalFormView