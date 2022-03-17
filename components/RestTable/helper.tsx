import type { ProColumns } from '@ant-design/pro-table';
import { Tag, Space } from 'antd'
import lstring from '../..//ts/localize'
import type { ColumnList, Column, PageParams, SortFilter, FilterElem, Row, RowData, JsonTableResult, TableHookParam } from './types';
import type { TAction, TActions, TTag, TTags, FieldValue, ColumnValue, AddStyle, FormMessage, ClickResult } from './types';
import { callJSFunction } from '../../ts/j'
import { log } from '../../ts/j'
import type { ReactElement } from 'react';
import type CSS from 'csstype';
import React from 'react';

// =================================
// create ProColumns from columns
// =================================

function clickAction(t: TAction, row: Row, r: TableHookParam) {
  let res: ClickResult = t
  if (t.jsclick)
    res = callJSFunction(t.jsclick as string, row);
  r.fresult(row, res);
}

function constructAction(t: TAction, row: Row, r: TableHookParam): ReactElement {
  return <a onClick={() => clickAction(t, row, r)}>{makeMessage(t, row)}</a>
}

function constructactionsCol(a: TActions, row: Row, r: TableHookParam): ReactElement {

  let act: TAction[] = a
  if (a.js)
    act = callJSFunction(a.js as string, row);
  return <Space size='middle'>
    {
      act.map(t => constructAction(t, row, r))
    }
  </Space>

}

function getAddStyle(a: AddStyle, row: Row): CSS.Properties | undefined {
  if (a.style) return a.style;
  const s: CSS.Properties = callJSFunction(a.js as string, row);
  return s;
}

function getValue(a: ColumnValue, row: Row): FieldValue {
  if (a.js) {
    const v: ColumnValue | undefined = callJSFunction(a.js as string, row);
    if (v == undefined) return undefined;
    // recursive
    return getValue(v, row)
  }
  if (a.value) return a.value;
  return makeMessage(a, row);
}

function constructSingleTag(tag: TTag, row: Row): ReactElement {

  const value: FieldValue = getValue(tag.value, row);
  return <Tag {...tag.props}>{value}</Tag>
}


function constructTags(tag: TTags, row: Row): ReactElement {

  let tags: TTag[] = []
  if (tag.js)
    tags = callJSFunction(tag.js, row) as TTag[]
  else tags = tag

  return <React.Fragment>
    {
      tags.map(t => constructSingleTag(t, row))
    }

  </React.Fragment>

}

function constructRenderCell(c: Column, r: TableHookParam) {
  return (dom: any, entity: any): ReactElement => {
    const style: CSS.Properties = {}
    let rendered = dom
    if (c.value) rendered = getValue(c.value, entity);
    if (c.tags) rendered = constructTags(c.tags, entity)
    if (c.actions) rendered = constructactionsCol(c.actions, entity, r)
    if (c.ident) {
      const ident: number = callJSFunction(c.ident, entity) * 12;
      style.paddingLeft = `${ident}px`;
      //style.fontWeight = 'bold';
    }
    if (c.addstyle) {
      const a: CSS.Properties | undefined = getAddStyle(c.addstyle, entity);
      // can be undefined
      if (a) for (const k in a) style[k] = a[k]
    }
    if (c.ident || c.addstyle)
      rendered = <span style={style}>{dom}</span>

    if (c.showdetails) return <a onClick={() => r.fdetails(entity)}>
      {rendered}
    </a>
    else return rendered
  }
}

function isRenderable(c: Column): boolean {
  return c.showdetails != undefined || c.ident != undefined || c.value != undefined || c.tags != undefined || c.actions != undefined
}

function transformOneColumn(c: Column, r: TableHookParam): ProColumns {
  const mess: string = c.field
  const e: ProColumns = {
    title: (
      <div>{lstring(mess)}</div>
    ),
    dataIndex: c.field,
    ...c.props
  }
  if (isRenderable(c)) {
    e.render = constructRenderCell(c, r);
  }

  return e;
}


export function transformColumns(cols: ColumnList, r: TableHookParam): ProColumns[] {

  return (cols.columns.map(c => transformOneColumn(c, r)));
}

// ====================================
// sorting and filtering
// ====================================

const ASCEND: string = 'ascend';
const DESCEND: string = 'descend';

export function analyzeSortFilter(r: ColumnList, params: PageParams, options?: { [key: string]: any }): SortFilter | undefined {

  // look for filter
  const filter: FilterElem[] =
    r.columns.filter(c => params[c.field] != undefined).map(c => ({
      field: c.field,
      value: params[c.field],
      uppercase: (params[c.field] as string).toUpperCase()
    }))

  // loook for sort
  let sortincc: string | undefined;

  let sortdecc: string | undefined;

  for (const k in options) {
    if (options[k] == ASCEND) sortincc = k
    if (options[k] == DESCEND) sortdecc = k
  }


  if (filter.length == 0 && sortinc == undefined && sortdecc == undefined) return undefined
  return {
    filter: filter.length == 0 ? undefined : filter,
    sortinc: sortincc,
    sortdec: sortdecc
  }
}

function neqString(value: string | undefined, filter: string): boolean {
  if (value == undefined) return true;
  return value.toUpperCase().indexOf(filter) == -1;
}


function filterRowMatch(cols: ColumnList, row: Row, sf: SortFilter): boolean {
  for (const f of sf.filter as FilterElem[]) {
    if (neqString(row[f.field], f.uppercase)) return false
  }
  return true;
}

function sortinc(a: Row, b: Row, field: string): number {
  const fielda: string | undefined = (a[field] as string | undefined)
  if (fielda == undefined) return 1
  const fieldb: string = (b[field] as string)
  return fielda.localeCompare(fieldb)
}

export function dataSortFilter(cols: ColumnList, data: JsonTableResult, sf: SortFilter): JsonTableResult {

  const filteredD: RowData = sf.filter == undefined ? data.data : data.data.filter(r => filterRowMatch(cols, r, sf))


  if (sf.sortdec) filteredD.sort((a: Row, b: Row) => sortinc(b, a, sf.sortdec as string))

  if (sf.sortinc) filteredD.sort((a: Row, b: Row) => sortinc(a, b, sf.sortinc as string))

  return { data: filteredD };
}

// =========================================
// message from object
// =========================================

export function makeMessage(m: FormMessage, row?: Row, vars?: any): string | undefined {

  if (m.messagedirect) return m.messagedirect

  if (m.js) {
    const res: any = callJSFunction(m.js, row, vars)
    // recursive !
    return makeMessage(res as FormMessage, row, vars)
  }
  if (m.message) return lstring(m.message);
  log('makeMessage - incorrect FomrMessage parameter')
  return undefined

}
