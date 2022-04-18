import { Table } from "antd"
import type { ColumnType } from "antd/lib/table";
import React, { ReactElement } from "react"
import { ColumnList, TColumn } from "../../ts/typing"
import { sumnumbers } from '../js/helper'
import { FieldValue, RowData, TRow } from '../../../ts/typing'
import { getValue } from "../../ts/helper";
import { modifyColProps } from "../../ts/transcol";

type TSummaryTable = ColumnList & {
  list: RowData,
  vars?: TRow
}

function getSummaryValue(h: TColumn, p: TSummaryTable, vars?: TRow): FieldValue {

  if (h.sum) return sumnumbers(p.list, h.field)
  if (h.value) return getValue(h.value, { r: {}, t:p.list, vars: vars})
  return '?'
}

function produceCell(i: number, c: TColumn, p: TSummaryTable, vars?: TRow): ReactElement {

  const h: TColumn | undefined = p.summary?.columns?.find(e => e.field === c.field)

  const v: FieldValue = h ? getSummaryValue(h, p,vars) : undefined

  const tprops: ColumnType<any> = h?.props ? h.props as ColumnType<any> : {}
  modifyColProps(c, tprops);


  return <Table.Summary.Cell key={i} {...tprops} index={i}>{v}</Table.Summary.Cell>
}

const SummaryTable: React.FC<TSummaryTable> = (props) => {

  let i: number = 0

  return <Table.Summary fixed>
    <Table.Summary.Row>
      {props.extendable ? <Table.Summary.Cell index={i++}></Table.Summary.Cell> : undefined}
      {props.columns?.map(e => produceCell(i++, e, props, props.vars))}
    </Table.Summary.Row>
  </Table.Summary>
}

export default SummaryTable