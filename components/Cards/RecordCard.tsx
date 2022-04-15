import React, { CSSProperties, ReactNode } from "react";
import { Card, Col, Divider, Row } from 'antd'
import { blue } from '@ant-design/colors';

import { FormMessage, TColumn, TDetailsCard } from "../ts/typing"
import { detailsTitle, findColDetails, appendStyle, makeMessage } from "../ts/helper";
import { fieldTitle } from '../ts/transcol';

function toCardRow(e: TColumn, t: TDetailsCard): ReactNode {
    return <Row key={e.field} {...t.rowprops}>
        {e.divider ? <Divider {...e.divider.props}>{makeMessage(e.divider as FormMessage, t.r)}</Divider> : undefined}
        <Col> {fieldTitle(e)}</Col>
        <Col >{t.r[e.field]}</Col>
    </Row>
}

const RecordCard: React.FC<TDetailsCard> = (props) => {

    const [isfield, title] = detailsTitle(props, props.r)
    const tcol: TColumn | undefined = findColDetails(props)
    const cols: TColumn[] = (tcol !== undefined && isfield) ? props.columns.filter(e => e.field !== tcol.field) : props.columns

    const selectedcolors: CSSProperties =
        props.isCurrentDB && props.isCurrentDB(props.r) ? { borderStyle: 'solid', borderWidth: '5px', borderColor: blue[1] } : {}

    const propsC = appendStyle(props.cardprops, selectedcolors)

    return <Card onClick={() => { if (props.onRowClick) props.onRowClick(props.r) }}
        title={title}
        {...propsC} >
        {
            cols.map(e => toCardRow(e, props))
        }
    </Card>
}

export default RecordCard
