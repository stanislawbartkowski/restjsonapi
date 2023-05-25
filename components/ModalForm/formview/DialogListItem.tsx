import React, { ReactNode } from "react";
import { Card, Form, FormListFieldData, Space, Button } from "antd";
import { MinusCircleOutlined } from '@ant-design/icons';

import getIcon from "../../../ts/icons";
import { getButtonName } from "../../../ts/j";
import { ButtonElem } from "../../../ts/typing";
import { cardProps } from "../../ts/helper";
import { IFieldContext, FField, ErrorMessages } from "./types";
import { produceFormItem } from "./EditItems";

// ================================
// list item
// ================================


export function createList(ir: IFieldContext, t: FField, err: ErrorMessages): ReactNode {

    const addButton: ButtonElem = t.list?.addbutton as ButtonElem

    const plusicon: ReactNode = getIcon(addButton.icon ? addButton.icon : 'plusoutlined');

    const addname = getButtonName(addButton)

    return <Card bordered {...cardProps(t.list?.card)}>
        <Form.List name={t.field} key={t.field} {...t.list?.props} >
            {(fields, { add, remove }) => (
                <React.Fragment>
                    {fields.map((field: FormListFieldData, index) => (
                        <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            {produceFormItem(ir, t, err, field)}
                            <MinusCircleOutlined rev onClick={() => remove(field.name)} />
                        </Space>
                    ))}
                    <Form.Item>
                        <Button type="dashed" onClick={() => add({})} block {...addButton.props} icon={plusicon}>
                            {addname}
                        </Button>
                    </Form.Item>
                </React.Fragment>
            )}

        </Form.List>
    </Card>
}