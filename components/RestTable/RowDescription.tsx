import { Descriptions } from 'antd';
import type { ColumnType } from 'antd/lib/table/interface';
import React from 'react';

import type { TColumn, ColumnList, TRow, ShowDetails } from './typing';
import { findColDetails, makeMessage } from './js/helper'
import { isObject } from '../../ts/j';


type DescriptionDetailsType = ColumnList & {
  cols: ColumnType<any>[]
  r: TRow
}

function toDescritionItem(c: ColumnType<any>, r: TRow) {
  return <Descriptions.Item label={c.title}>
    {r[(c.dataIndex as string)]}
  </Descriptions.Item>

}

function detailsTitle(c: ColumnList, row: TRow): string | undefined {

  const C: TColumn | undefined = findColDetails(c)
  if (C === undefined) return undefined;
  if (!isObject(C.showdetails))
    return c.rowkey ? row[c.rowkey] : undefined
  const s: ShowDetails = C.showdetails as ShowDetails
  if (s.title === undefined) return undefined;
  return makeMessage(s.title, row)
}


const DescriptionsDetails: React.FC<DescriptionDetailsType> = (props) => {
  const title: string | undefined = detailsTitle(props, props.r)

  // to remove action column
  function isAction(field: string): boolean {
    const c: TColumn | undefined = props.columns.find(e => e.field == field)
    if (c === undefined) return false
    return c.actions !== undefined
  }

  return (
    < Descriptions
      column={1}
      title={title}
      bordered
    >
      {
        props.cols.filter(c => !isAction(c.dataIndex as string)).map(c => toDescritionItem(c, props.r))
      }
    </Descriptions>
  )
}

export default DescriptionsDetails;
