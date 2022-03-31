import React from "react";
import { Card } from 'antd'

import { ColumnList, TColumn, TRow } from "../typing"
import { detailsTitle, findColDetails } from '../js/helper'
import { RestTableParam } from "../../../ts/typing"

type CardData = RestTableParam & {
    cards: ColumnList,
    r: TRow,
}

const RecordCard: React.FC<CardData> = (props) => {

    const title: string | undefined = detailsTitle(props.cards, props.r)
    const tcol: TColumn | undefined = findColDetails(props.cards)
    const cols: TColumn[] = tcol ? (props.cards.cards as TColumn[]).filter(e => e.field !== tcol.field) : (props.cards.cards as TColumn[])


    return <Card onClick={() => { if (props.onRowClick) props.onRowClick(props.r) }}
        title={title}
        bordered hoverable
        style={{ width: 200, minHeight: 150, borderRadius: 10 }}
        headStyle={{ backgroundColor: '#f5f5f5' }} >
        {
            cols.map(e => <p key={e.field}>{props.r[e.field]}</p>)
        }
    </Card>
}

export default RecordCard
