import { Table } from "antd"
import type { ColumnType } from "antd/lib/table";
import React, { ReactElement } from "react"
import { ColumnList, TColumn, TColumns, TSummary } from "../../ts/typing"
import { sumnumbers, visibleColumns } from '../js/helper'
import { FieldValue, RowData, TRow } from '../../../ts/typing'
import { modifyColProps } from "../../ts/transcol";
import { isOArray } from "../../../ts/j";
import { transformCell } from "../../ts/tranformlist";

type TSummaryTable = ColumnList & {
  list: RowData,
  vars?: TRow
}

function getSummaryValue(h: TColumn, p: TSummaryTable, vars?: TRow): FieldValue {

  const r: TRow = {}
  if (h.sum) r[h.field] = sumnumbers(p.list, h.field)
  return transformCell(h, { r: r, t: p.list, vars: vars })
  //  if (h.value) return getValue(h.value, { r: {}, t: p.list, vars: vars })
  //  return '?'
}

function produceCell(i: number, c: TColumn, p: TSummaryTable, sumline: ColumnList, vars?: TRow): ReactElement {

  const h: TColumn | undefined = sumline.columns?.find(e => e.field === c.field)

  const v: FieldValue = h ? getSummaryValue(h, p, vars) : undefined

  const tprops: ColumnType<any> = h?.props ? h.props as ColumnType<any> : {}
  modifyColProps(c, tprops);


  return <Table.Summary.Cell key={i} {...tprops} index={i}>{v}</Table.Summary.Cell>
}

const SummaryTable: React.FC<TSummaryTable> = (props) => {

  let i: number = 0

  const cols: TColumns = visibleColumns(props.columns)

  const summary: TSummary = props.summary as TSummary

  const lines: ColumnList[] = isOArray(summary) ? (summary as ColumnList[]) : [summary as ColumnList]

  return <Table.Summary fixed >
    {lines.map(sumline =>
      <Table.Summary.Row {...sumline.rowprops}>
        {props.extendable ? <Table.Summary.Cell index={i++}></Table.Summary.Cell> : undefined}
        {cols?.map(e => produceCell(i++, e, props, sumline, props.vars))}
      </Table.Summary.Row>
    )
    }

  </Table.Summary>
}

export default SummaryTable