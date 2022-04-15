import React from 'react';
import { Descriptions, DescriptionsProps } from 'antd';

import { TRow } from '../../ts/typing';
import { detailsTitle } from '../ts/helper';
import { TColumn, TDetailsCard } from '../ts/typing';
import { fieldTitle } from '../ts/transcol';


function toDescritionItem(c: TColumn, r: TRow) {
  return <Descriptions.Item label={fieldTitle(c)}>
    {r[c.field]}
  </Descriptions.Item>

}

const DescriptionsDetails: React.FC<TDetailsCard> = (props) => {
  const [_, title, deprops] = detailsTitle(props, props.r)

  // to remove action column
  function isAction(field: string): boolean {
    const c: TColumn | undefined = (props.columns as TColumn[]).find(e => e.field === field)
    if (c === undefined) return false
    return c.actions !== undefined
  }

  const dprops: DescriptionsProps = deprops ? deprops : { column: 1, bordered: true }
  dprops.title = title

  return (
    < Descriptions {...dprops} >
      {
        props.columns?.filter(c => !isAction(c.field)).map(c => toDescritionItem(c, props.r))
      }
    </Descriptions>
  )
}

export default DescriptionsDetails;