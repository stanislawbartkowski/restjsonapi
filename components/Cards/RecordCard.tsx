import React, { CSSProperties, ReactNode } from "react";
import { Card, Col, Row } from 'antd'
import { blue } from '@ant-design/colors';

import { TColumn, TDetailsCard } from "../ts/typing"
import { detailsTitle, findColDetails, appendStyle, cardProps, } from "../ts/helper";
import { fieldTitle, makeDivider } from '../ts/transcol';
import { OneRowData } from "../../ts/typing";

function toCardRow(e: TColumn, t: TDetailsCard, pars: OneRowData): ReactNode {
    return <Row key={e.field} {...t.rowprops}>
        {e.divider ? makeDivider(e.divider, { r: t.r, vars: t.vars }) : undefined}
        <Col> {fieldTitle(e, pars)}</Col>
        <Col >{t.r[e.field]}</Col>
    </Row>
}

const RecordCard: React.FC<TDetailsCard> = (props) => {

    const pars: OneRowData = { vars: props.vars, r: props.r }

    const [isfield, title] = detailsTitle(props, pars)
    const tcol: TColumn | undefined = findColDetails(props)
    const cols: TColumn[] = (tcol !== undefined && isfield) ? props.columns.filter(e => e.field !== tcol.field) : props.columns

    const selectedcolors: CSSProperties =
        props.isSelected && props.isSelected(props.r) ?
            props.card?.selectedprops ? { ...props.card.selectedprops } : { borderStyle: 'solid', borderWidth: '5px', borderColor: blue[1] }
            : {}

    const propsC = appendStyle(cardProps(props.card), selectedcolors)

    return <Card onClick={() => { if (props.onRowClick) props.onRowClick(props.r) }}
        title={title}
        {...propsC} >
        {
            cols.map(e => toCardRow(e, props, pars))
        }
    </Card>
}

export default RecordCard
