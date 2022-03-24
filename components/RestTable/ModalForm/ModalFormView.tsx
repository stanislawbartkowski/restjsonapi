import React, { forwardRef, useImperativeHandle } from 'react';


import { TField, TForm, FIELDTYPE, TRow } from '../typing'
import { trace } from '../../../ts/l'

import {
    Form,
    Input,
    DatePicker,
    InputNumber
} from 'antd';

import { fieldTitle, fieldType } from '../helper';

import { FormInstance } from 'antd/es/form';

function ltrace(mess: string) {
    trace('ModalFormView',mess)
}

export interface IRefCall {
    validate: () => any
}

type TFormView = TForm & {
    buttonClicked: (row: TRow) => void
}

function produceElem(t: TField): React.ReactNode {
    const fieldtype: FIELDTYPE = fieldType(t)
    switch (fieldtype) {
        case FIELDTYPE.NUMBER: return <InputNumber />
        case FIELDTYPE.DATE: return <DatePicker />
    }
    return <Input />
}

function produceItem(t: TField): React.ReactNode {

    const mess: string = fieldTitle(t);
    return <Form.Item {...t.props} name={t.field} key={t.field} label={mess}  >
        {produceElem(t)}
    </Form.Item>
}


const ModalFormView = forwardRef<IRefCall, TFormView>((props, ref) => {

    const [f]: [FormInstance] = Form.useForm()

    const onFinish = (values: TRow) => {
        ltrace('Success, data validated')
        props.buttonClicked(values)
    };

    useImperativeHandle(ref, () => ({
        validate: () => {
            ltrace('Validate through useRef');
            f.submit()
        }
    }));

    const form = <Form labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }} form={f} onFinish={onFinish}
        layout="horizontal">

        {props.fields.map(produceItem)}

    </Form>


    return form
})

export default ModalFormView