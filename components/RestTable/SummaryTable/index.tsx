import { Table } from "antd"
import type { ColumnType } from "antd/lib/table";
import React, { ReactElement } from "react"
import { ColumnList, TColumn } from "../typing"
import { sumnumbers, getValue, modifyColProps } from '../js/helper'
import { FieldValue, RowData } from '../../../ts/typing'

type TSummaryTable = ColumnList & {
  list: RowData,
}

function getSummaryValue(h: TColumn, p: TSummaryTable): FieldValue {

  if (h.sum) return sumnumbers(p.list, h.field)
  if (h.value) return getValue(h.value, p.list)
  return '?'
}

function produceCell(i: number, c: TColumn, p: TSummaryTable): ReactElement {

  const h: TColumn | undefined = p.summary?.columns?.find(e => e.field === c.field)

  const v: FieldValue = h ? getSummaryValue(h, p) : undefined

  const tprops: ColumnType<any> = h?.props ? h.props as ColumnType<any> : {}
  modifyColProps(c, tprops);


  return <Table.Summary.Cell key={i} {...tprops} index={i}>{v}</Table.Summary.Cell>
}

const SummaryTable: React.FC<TSummaryTable> = (props) => {

  let i: number = 0

  return <Table.Summary fixed>
    <Table.Summary.Row>
      {props.extendable ? <Table.Summary.Cell index={i++}></Table.Summary.Cell> : undefined}
      {props.columns?.map(e => produceCell(i++, e, props))}
    </Table.Summary.Row>
  </Table.Summary>
}

export default SummaryTable