import { Descriptions } from 'antd';
import type { ColumnType } from 'antd/lib/table/interface';
import React from 'react';

import type { TColumn, ColumnList, Row, ShowDetails } from './types';
import { findColDetails, makeMessage } from './helper'
import { isObject } from '../../ts/j';


type DescriptionDetailsType = ColumnList & {
  cols: ColumnType<any>[]
  r: Row
}

function toDescritionItem(c: ColumnType<any>, r: Row) {
  return <Descriptions.Item label={c.title}>
    {r[(c.dataIndex as string)]}
  </Descriptions.Item>

}

function detailsTitle(c: ColumnList, row: Row): string | undefined {

  const C: TColumn | undefined = findColDetails(c)
  if (C == undefined) return undefined;
  if (!isObject(C.showdetails))
    return c.rowkey ? row[c.rowkey] : undefined
  const s: ShowDetails = C.showdetails as ShowDetails
  if (s.title == undefined) return undefined;
  return makeMessage(s.title, row)
}


const DescriptionsDetails: React.FC<DescriptionDetailsType> = (props) => {
  const title: string | undefined = detailsTitle(props, props.r)
  return (
    < Descriptions
      column={1}
      title={title}
      bordered
    >
      {
        props.cols.map(c => toDescritionItem(c, props.r))
      }
    </Descriptions>
  )
}

export default DescriptionsDetails;
