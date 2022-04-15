import React, { useEffect, useState } from 'react';

import { RestTableParam, TRow } from '../../ts/typing';
import readdefs, { ReadDefsResult } from "../ts/readdefs";
import { ColumnList, Status } from '../ts/typing';
import RestTableDefError from "../errors/ReadDefError";
import RowDescription from './RowDescription'
import RecordCard from '../Cards/RecordCard'
import { copyAndTransform } from '../ts/tranformlist'

type TShowRowDetails = RestTableParam & {
  r: TRow
}

const ShowDetails: React.FC<TShowRowDetails> = (props) => {

  const [state, setState] = useState<ReadDefsResult>({
    status: Status.PENDING
  });

  useEffect(() => {

    readdefs(props, (d: ReadDefsResult) => setState({ ...d }))

  }, [props.listdef]);

  if (state.status === Status.PENDING) return null;

  if (state.status === Status.ERROR) return <RestTableDefError />

  const col: ColumnList = state.res as ColumnList

  return col.iscard ? <RecordCard {...col} {...props} /> : <RowDescription {...col} r={copyAndTransform(props.r, col.columns)} />

}

export default ShowDetails;