import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';

import { ModalListProps, TField, TForm, TYPEDATE, TYPENUMBER, TYPESTRING } from './typing'
import { Status } from './typing'
import readdefs, { ReadDefsResult } from "./readdefs";
import InLine from '../../ts/inline';
import lstring from "../..//ts/localize";

import {
    Form,
    Input,
    Button,
    Radio,
    Select,
    Cascader,
    DatePicker,
    InputNumber,
    TreeSelect,
    Switch,
} from 'antd';

type DataFormState = {
    status: Status;
    tabledata?: TForm;
    js?: any
};

function produceElem(t: TField): React.ReactNode {
    const fieldtype: string = t.fieldtype ? t.fieldtype : TYPESTRING
    switch (fieldtype) {
        case TYPENUMBER: return <InputNumber />
        case TYPEDATE: return <DatePicker />
    }
    return <Input />
}

function produceItem(t: TField): React.ReactNode {

    const mess: string = lstring(t.coltitle ? t.coltitle : t.field);
    return <Form.Item key={t.field} label={mess} >
        {produceElem(t)}
    </Form.Item>
}


const ModalFormView: React.FC<TForm> = (props) => {

    return <Form labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal">

        {props.fields.map(produceItem)}

    </Form>
}


const ModalForm: React.FC<ModalListProps> = (props) => {

    const [formdef, setState] = useState<DataFormState>({
        status: Status.PENDING,
        tabledata: { fields: [] }
    });

    useEffect(() => {

        if (props.listdef === undefined) return

        function setS(d: ReadDefsResult) {

            if (d.status === Status.READY)
                setState({
                    status: Status.READY,
                    tabledata: { ...(d.res as TForm) },
                    js: d.js,
                })
            else setState({
                status: Status.ERROR,
            })

        }

        readdefs(props, setS)

    }, [props.listdef]);

    if (formdef.status === Status.PENDING) return null

    return <React.Fragment>
        <InLine js={formdef.js} />
        <Modal destroyOnClose visible={props.visible}
            onOk={props.closehook} onCancel={props.closehook} {...props.props} footer={null} >
            {formdef.status === Status.READY ? <ModalFormView {...(formdef.tabledata as TForm)} /> : undefined}
        </Modal >
    </React.Fragment>
}

export default ModalForm
