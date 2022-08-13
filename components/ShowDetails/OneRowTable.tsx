import React, { useEffect, useState } from 'react';

import { ColumnList, Status, TDetailsCard, TRestVars } from '../ts/typing';
import RowDescription from './RowDescription'
import RecordCard from '../Cards/RecordCard'
import { copyAndTransform } from '../ts/tranformlist'
import { OneRowData, TRow } from '../../ts/typing';
import readlist, { DataSourceState } from '../ts/readlist';
import ReadListError from '../errors/ReadListError';
import { callJSFunction } from '../../ts/j';

const OneRowTable: React.FC<TDetailsCard> = (props) => {

    const [datasource, setDataSource] = useState<DataSourceState>({
        status: Status.PENDING,
        res: [],
        vars: props.vars
    });

    function toPars(): OneRowData {
        return { vars: datasource.vars, r: props.r }
    }

    const col: ColumnList = props

    useEffect(() => {
        if (props.varsrestaction === undefined) {
            setDataSource({ status: Status.READY, res: [], vars: props.vars })
            return
        }
        const varsaction: TRestVars = props.varsrestaction?.js ? callJSFunction(props.varsrestaction.js, toPars()) : props.varsrestaction as TRestVars

        readlist({ ...props, ...varsaction, vars: { ...props.r } }, (s: DataSourceState) => { setDataSource({ ...s }) })
    }
        , [props.varsrestaction, props.r, props.vars]);

    if (datasource.status === Status.ERROR) return <ReadListError />
    if (datasource.status === Status.PENDING) return <span></span>


    const r: TRow = copyAndTransform(col.columns, toPars())

    return col.iscard ? <RecordCard {...col} {...props} r={r} /> : <RowDescription {...col} r={r} />

}

export default OneRowTable;
