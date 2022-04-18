import React, { } from 'react';

import { ColumnList, TDetailsCard } from '../ts/typing';
import RowDescription from './RowDescription'
import RecordCard from '../Cards/RecordCard'
import { copyAndTransform } from '../ts/tranformlist'
import { OneRowData, TRow } from '../../ts/typing';

const OneRowTable: React.FC<TDetailsCard> = (props) => {

    const col: ColumnList = props

    function toPars(): OneRowData {
        return { vars: props.vars, r: props.r }
    }

    const r: TRow = copyAndTransform(col.columns, toPars())

    return col.iscard ? <RecordCard {...col} {...props} r={r} /> : <RowDescription {...col} r={r} />

}

export default OneRowTable;