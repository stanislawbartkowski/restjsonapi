import React, { ReactElement } from "react"
import { Table } from "antd"
import type { ColumnType } from "antd/lib/table";

import { ColumnList, TColumn, TColumns, TSummary } from "./ts/typing"
import { FieldValue, FormMessage, RowData, TRow } from '../ts/typing'
import { modifyColProps } from "./ts/transcol";
import { isOArray, makeMessage } from "../ts/j";
import { transformCell } from "./ts/tranformlist";
import { sumnumbers } from "./ts/helper";

type TSummaryTable = {
  columns: TColumns
  summary?: TSummary;
  list: RowData,
  vars?: TRow
  isextendable: boolean
}

function getSummaryValue(h: TColumn, p: TSummaryTable, vars?: TRow): FieldValue {

  const r: TRow = {}
  if (h.sum) r[h.field] = sumnumbers(p.list, h.field)
  return transformCell(h, { r: r, t: p.list, vars: vars })
}

type BeforeReduced = {
  descr: FormMessage,
  fieldbefore: string | undefined
}


function isDescr(ii: number, c: TColumn, cols: TColumns, before: BeforeReduced[] | undefined, vars?: TRow): FieldValue {

  if (before === undefined) return undefined
  const i: number = ii % cols.length
  if (i >= (cols.length - 1)) return undefined
  const nextC: TColumn = cols[i + 1]
  for (let descr of before) {
    if (descr.fieldbefore !== undefined && nextC.field === descr.fieldbefore) {
      const mess = makeMessage(descr.descr, { r: {}, vars: vars })
      return mess
    }
  }
  return undefined
}

function reducedBefore(sumline: ColumnList, cols: TColumns): BeforeReduced[] | undefined {
  if (sumline.descr === undefined) return undefined
  const b: BeforeReduced[] = []
  sumline.descr.forEach(d => {
    const idbefore: TColumn | undefined = cols.find(c => d.before.includes(c.field))
    b.push({
      descr: d.descr,
      fieldbefore: idbefore === undefined ? undefined : idbefore.field
    })
  }
  )
  return b
}


function produceCell(i: number, c: TColumn, p: TSummaryTable, sumline: ColumnList, cols: TColumns, before: BeforeReduced[] | undefined, vars?: TRow): ReactElement {

  const h: TColumn | undefined = sumline.columns?.find(e => e.field === c.field)

  let v: FieldValue = h ? getSummaryValue(h, p, vars) : undefined
  if (v === undefined) {
    v = isDescr(i, c, cols, before, vars)
  }

  const tprops: ColumnType<any> = h?.props ? h.props as ColumnType<any> : {}
  modifyColProps({ ...c, ...h }, tprops);

  return <Table.Summary.Cell key={i} {...tprops} index={i}>{v}</Table.Summary.Cell>
}

const SummaryTable: React.FC<TSummaryTable> = (props) => {

  let i: number = 0

  const summary: TSummary = props.summary as TSummary

  const lines: ColumnList[] = isOArray(summary) ? (summary as ColumnList[]) : [summary as ColumnList]

  return <Table.Summary fixed >
    {lines.map(sumline =>
      <Table.Summary.Row {...sumline.rowprops}>
        {props.isextendable ? <Table.Summary.Cell index={i++}></Table.Summary.Cell> : undefined}
        {props.columns?.map(e => produceCell(i++, e, props, sumline, props.columns, reducedBefore(sumline, props.columns), props.vars))}
      </Table.Summary.Row>
    )
    }

  </Table.Summary>
}

export default SummaryTable