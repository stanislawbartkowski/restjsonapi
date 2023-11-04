import { List, Space } from "antd"
import { ReactNode } from "react"

import { isnotdefined, makeMessage, toS } from "../../../ts/j"
import lstring from "../../../ts/localize"
import { TRow, FIELDTYPE, FieldValue } from "../../../ts/typing"
import { fieldType, fieldTitle } from "../../ts/transcol"
import { TListItems, TRadioCheckItem } from "../../ts/typing"
import { itemName } from "./helper"
import { IFieldContext, FField, ErrorMessages } from "./types"

// -------------------------------
// data as display list
// -------------------------------


function transformToListItem(ir: IFieldContext, t: FField, err: ErrorMessages, li: TListItems, r: TRow): React.ReactNode {

    const ftype: FIELDTYPE = fieldType(t)
    const isnot: boolean = isnotdefined(r[t.field]) || r[t.field] === ""
    const value: FieldValue = isnot ? lstring("notdefined") : r[t.field]
    let values: string = value as string
    if (ftype === FIELDTYPE.BOOLEAN && !isnot) values = (value as boolean) ? lstring("yes") : lstring("no")

    const title: string = fieldTitle(t, { r: r })

    function findLabel(valuef: FieldValue, i: TRadioCheckItem[]): string {
        const value: string = toS(valuef)
        const item: TRadioCheckItem | undefined = i.find(e => toS(e.value) === value)
        return item ? itemName(item) as string : value as string
    }

    if (!isnot) {
        if (t.radio) {
            const i: TRadioCheckItem[] = t.radio.items as TRadioCheckItem[]
            values = findLabel(value, i)
        }
        if (t.checkbox) {
            const i: TRadioCheckItem[] = t.checkbox.items as TRadioCheckItem[]
            const v: FieldValue[] = r[t.field] as FieldValue[]
            if (v.length === 0) values = lstring("notdefined")
            else {
                values = v.reduce(
                    (pvalue: string, avalue: FieldValue) => pvalue === "" ? findLabel(avalue, i) : pvalue + " , " + findLabel(avalue, i),
                    "")
            }
        }

    }


    return <List.Item {...li.iprops}><Space {...li.lprops}>{title}</Space><Space {...li.vprops}> {values}</Space></List.Item>
}

export function createItemList(ir: IFieldContext, t: FField, err: ErrorMessages): ReactNode {
    const li: TListItems = t.itemlist as TListItems
    const r: TRow = ir.getValues()
    const dsource: FField[] = t.items as FField[]
    const header = li.header ? makeMessage(li.header, { r: r }) : undefined
    const footer = li.footer ? makeMessage(li.footer, { r: r }) : undefined
    return <List size="small" header={header} footer={footer} dataSource={dsource} {...t.props} renderItem={(item: FField) => transformToListItem(ir, item, err, li, r)} />
}
