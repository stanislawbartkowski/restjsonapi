import React, { useEffect, useState } from 'react';

import { OneRowData, RestTableParam } from '../../ts/typing';
import readdefs, { ReadDefsResult } from "../ts/readdefs";
import { ColumnList, Status } from '../ts/typing';
import RestTableDefError from "../errors/ReadDefError";
import OneRowTable from './OneRowTable';

type TShowRowDetails = RestTableParam & OneRowData

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


  return <OneRowTable {...col} r={props.r} vars={props.vars}></OneRowTable>

}

export default ShowDetails;