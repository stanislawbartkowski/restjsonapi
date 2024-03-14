import React, { CSSProperties, ReactNode } from "react";
import { Card, Col, Row } from 'antd'
import { blue } from '@ant-design/colors';
import { PlusCircleOutlined } from "@ant-design/icons";

import { ButtonAction, ColumnList, FActionResult, TableHookParam, TActions, TColumn, TColumns, TDetailsCard } from "../ts/typing"
import { detailsTitle, findColDetails, appendStyle, cardProps, visibleColumns, } from "../ts/helper";
import { fieldTitle, fieldType, HTMLElem, makeDivider, constructactionsCol } from '../ts/transcol';
import { FIELDTYPE, OneRowData } from "../../ts/typing";
import { getButtonName } from "../../ts/j";
import lstring from "../../ts/localize";

function toCardRow(e: TColumn, t: TDetailsCard, pars: OneRowData): ReactNode {

    const ftype: FIELDTYPE = fieldType(e)
    const content: React.ReactElement = ftype === FIELDTYPE.HTML ? HTMLElem(t.r[e.field] as string) : <span>{t.r[e.field]}</span>

    return <Row key={e.field} {...t.rowprops}>
        {e.divider ? makeDivider(e.divider, { r: t.r, vars: t.vars }) : undefined}
        <Col> {fieldTitle(e, pars)}</Col>
        <Col {...t.props} >{content}</Col>
    </Row>
}

const RecordCard: React.FC<TDetailsCard & { a?: TActions, h?: TableHookParam }> = (props) => {


    const pars: OneRowData = { vars: props.vars, r: props.r }

    const extram = (props.a !== undefined) ? constructactionsCol(props.a, props.h as TableHookParam, pars) : undefined

    const [isfield, title] = detailsTitle(props, pars)
    const rtitle: React.ReactElement = isfield ? <span style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>{title}</span> : <span></span>
    const tcol: TColumn | undefined = findColDetails(props)
    const fcols: TColumns = visibleColumns(props.columns,true);
    const cols: TColumn[] = (tcol !== undefined && isfield) ? fcols.filter(e => e.field !== tcol.field) : fcols

    const selectedcolors: CSSProperties =
        props.isSelected && props.isSelected(props.r) ?
            props.card?.selectedprops ? { ...props.card.selectedprops } : { borderStyle: 'solid', borderWidth: '5px', borderColor: blue[1] }
            : {}

    const propsC = appendStyle(cardProps(props.card), selectedcolors)

    return <Card extra={extram} onClick={() => { if (props.onRowClick) props.onRowClick(props.r) }}
        title={rtitle}
        {...propsC} >
        {
            cols.map(e => toCardRow(e, props, pars))
        }
    </Card>
}

export const AddCard: React.FC<ColumnList & { b: ButtonAction, cardClick: FActionResult }> = (props) => {

    const b: ButtonAction = props.b

    const propsC = cardProps(props.card)
    const name: string = b.name !== undefined ? getButtonName(b) : lstring('addaction')

    //const iadd = <PlusCircleOutlined style={{ fontSize: '300%' }} />
    const iadd = <PlusCircleOutlined />

    return <Card onClick={() => props.cardClick({}, b)}
        title={name}
        {...propsC} >
        <Row align="middle" justify="center"><Col>{iadd}</Col></Row>
    </Card>

}

export default RecordCard
