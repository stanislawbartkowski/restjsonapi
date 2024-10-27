import React, { useEffect, useState } from 'react';

import { ColumnList, Status, TDetailsCard, TRestVars } from '../ts/typing';
import RowDescription from './RowDescription'
import RecordCard from '../Cards/RecordCard'
import { copyAndTransform } from '../ts/tranformlist'
import { OneRowData, TRow } from '../../ts/typing';
import readlist, { DataSourceState } from '../ts/readlist';
import ReadListError from '../errors/ReadListError';
import { callJSFunction } from '../../ts/j';

type DataSourceStateOne = DataSourceState & {
    r: TRow
}

const OneRowTable: React.FC<TDetailsCard> = (props) => {

    const [datasource, setDataSource] = useState<DataSourceStateOne>({
        status: Status.PENDING,
        res: [],
        vars: props.vars,
        r: props.r
    });

    function toPars(): OneRowData {
        return { vars: datasource.vars, r: datasource.r }
    }

    const col: ColumnList = props

    const setS = (s: DataSourceState) => {
        setDataSource({ ...s, r: { ...datasource.r, ...s.vars } })
    }

    useEffect(() => {
        if (props.varsrestaction === undefined) {
            setDataSource({ status: Status.READY, res: [], vars: props.vars, r: props.r })
            return
        }
        const varsaction: TRestVars = props.varsrestaction?.js ? callJSFunction(props.varsrestaction.js, toPars()) : props.varsrestaction as TRestVars


        readlist({ ...props, ...varsaction, vars: { ...props.r } }, setS)
    }, [props.varsrestaction, props.vars, props.r]);
    // Data: 2023/11/18 - removed props.r (risky, not sure)
    // Data: 2024/10/28 = restored, does not show properly

    if (datasource.status === Status.ERROR) return <ReadListError />
    if (datasource.status === Status.PENDING) return <span></span>


    const r: TRow = copyAndTransform(col.columns, toPars())

    return col.iscard ? <RecordCard {...col} {...props} r={r} /> : <RowDescription {...col} r={r} />

}

export default OneRowTable;
