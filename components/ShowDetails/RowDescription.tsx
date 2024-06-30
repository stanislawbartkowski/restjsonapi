import React, { ReactElement } from 'react';
import { Descriptions, DescriptionsProps } from 'antd';

import { FIELDTYPE, OneRowData, TRow } from '../../ts/typing';
import { detailsTitle, isColumnAction } from '../ts/helper';
import { TableHookParam, TColumn, TDetailsCard } from '../ts/typing';
import { fieldTitle, renderCell } from '../ts/transcol';

function isdiv(c: TColumn) {
  return c.fieldtype === FIELDTYPE.HTML
}

function toDescritionItem(c: TColumn, pars: OneRowData) {
  const f: TableHookParam = { fdetails: undefined, fresult: undefined }
  const elem: ReactElement = renderCell(c, <div>{pars.r[c.field] as string}</div>, pars.r, f, pars.vars, true)
  const label = isdiv(c) ? elem : fieldTitle(c, pars)
  const val = isdiv(c) ? undefined : elem

  return <Descriptions.Item key={c.field} label={label} {...c.props}>
    {val}
  </Descriptions.Item>

}

const DescriptionsDetails: React.FC<TDetailsCard> = (props) => {
  const [_, title, deprops] = detailsTitle(props, { r: props.r, vars: props.vars })

  // to remove action column
  function isAction(field: string): boolean {
    const c: TColumn | undefined = (props.columns as TColumn[]).find(e => e.field === field)
    if (c === undefined) return false
    //return !c.actions.showindetails
    return isColumnAction(c)
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