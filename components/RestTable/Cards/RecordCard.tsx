import React, { CSSProperties } from "react";
import { Card } from 'antd'
import { blue } from '@ant-design/colors';

import { ColumnList, TColumn } from "../typing"
import { detailsTitle, findColDetails } from '../js/helper'
import { RestTableParam, FIsCurrentDB, TRow } from "../../../ts/typing"

type CardData = RestTableParam & {
    cards: ColumnList,
    r: TRow,
    isCurrentDB?: FIsCurrentDB
}

const RecordCard: React.FC<CardData> = (props) => {

    const title: string | undefined = detailsTitle(props.cards, props.r)
    const tcol: TColumn | undefined = findColDetails(props.cards)
    const cols: TColumn[] = tcol ? (props.cards.cards as TColumn[]).filter(e => e.field !== tcol.field) : (props.cards.cards as TColumn[])

    const selectedcolors: CSSProperties =
        props.isCurrentDB && props.isCurrentDB(props.r) ? { borderStyle: 'solid', borderWidth: '5px', borderColor: blue[1] } : {}


    return <Card onClick={() => { if (props.onRowClick) props.onRowClick(props.r) }}
        title={title}
        bordered hoverable
        style={{ width: 200, minHeight: 150, borderRadius: 10, ...selectedcolors }}
        headStyle={{ backgroundColor: '#f5f5f5' }} >
        {
            cols.map(e => <p key={e.field}>{props.r[e.field]}</p>)
        }
    </Card>
}

export default RecordCard
