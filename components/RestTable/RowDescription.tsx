import { Descriptions } from 'antd';
import type { ColumnType } from 'antd/lib/table/interface';
import React from 'react';

import type { TColumn, ColumnList } from './typing';
import { detailsTitle } from './js/helper'
import type { TRow} from '../../ts/typing'



type DescriptionDetailsType = ColumnList & {
  cols: ColumnType<any>[]
  r: TRow
}

function toDescritionItem(c: ColumnType<any>, r: TRow) {
  return <Descriptions.Item label={c.title}>
    {r[(c.dataIndex as string)]}
  </Descriptions.Item>

}

const DescriptionsDetails: React.FC<DescriptionDetailsType> = (props) => {
  const title: string | undefined = detailsTitle(props, props.r)

  // to remove action column
  function isAction(field: string): boolean {
    const c: TColumn | undefined = (props.columns as TColumn[]).find(e => e.field == field)
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
