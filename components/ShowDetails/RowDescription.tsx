import React, { ReactElement } from 'react';
import { Descriptions, DescriptionsProps } from 'antd';

import { OneRowData, TRow } from '../../ts/typing';
import { detailsTitle } from '../ts/helper';
import { TableHookParam, TColumn, TDetailsCard } from '../ts/typing';
import { fieldTitle } from '../ts/transcol';
import { renderCell } from '../ts/transcol'


function toDescritionItem(c: TColumn, pars: OneRowData) {
  const f: TableHookParam = { fdetails: undefined, fresult: undefined }
  const elem: ReactElement = renderCell(c, <div>{pars.r[c.field]}</div>, pars.r, f, pars.vars)
  return <Descriptions.Item key={c.field} label={fieldTitle(c, pars)} {...c.props}>
    {elem}
  </Descriptions.Item>

}

const DescriptionsDetails: React.FC<TDetailsCard> = (props) => {
  const [_, title, deprops] = detailsTitle(props, { r: props.r, vars: props.vars })

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
        props.columns?.filter(c => !isAction(c.field)).map(c => toDescritionItem(c, { r: (props.r as TRow), vars: props.vars }))
      }
    </Descriptions>
  )
}

export default DescriptionsDetails;