import type { ReactElement } from "react";
import type CSS from "csstype";
import React from "react";
import type { ColumnType } from "antd/lib/table";
import { Tag, Space } from "antd";

import lstring from "../..//ts/localize";
import type { ColumnList, TColumn, TRow, TableHookParam, TFieldBase } from "./typing";
import type {
  TAction,
  TActions,
  TTag,
  TTags,
  FieldValue,
  ColumnValue,
  AddStyle,
  FormMessage,
  ClickResult,
  ColumnFilterSearch,
} from "./typing";
import { FIELDTYPE } from "./typing";
import { callJSFunction } from "../../ts/j";
import { log } from "../../ts/l";
import TableFilterProps from "./TableFilter";

// =================================
// create ProColumns from columns
// =================================

export function clickAction(t: TAction, row: TRow): ClickResult {
  let res: ClickResult = t;
  if (t.jsclick) res = callJSFunction(t.jsclick as string, row);
  return res;
}

function clickActionHook(t: TAction, row: TRow, r: TableHookParam) {
  const res: ClickResult = clickAction(t, row);
  r.fresult(row, res);
}

function constructAction(t: TAction, row: TRow, r: TableHookParam): ReactElement {
  return (
    <a onClick={() => clickActionHook(t, row, r)}>{makeMessage(t, row)}</a>
  );
}

function constructactionsCol(
  a: TActions,
  row: TRow,
  r: TableHookParam
): ReactElement {
  let act: TAction[] = a;
  if (a.js) act = callJSFunction(a.js as string, row);
  return (
    <Space size="middle">{act.map((t) => constructAction(t, row, r))}</Space>
  );
}

function getAddStyle(a: AddStyle, row: TRow): CSS.Properties {
  if (a.style) return a.style;
  const s: CSS.Properties = callJSFunction(a.js as string, row);
  return s;
}

function getValue(a: ColumnValue, row: TRow): FieldValue {
  if (a.js) {
    const v: ColumnValue | undefined = callJSFunction(a.js as string, row);
    if (v === undefined) return undefined;
    // recursive
    return getValue(v, row);
  }
  if (a.value) return a.value;
  return makeMessage(a, row);
}

function constructSingleTag(tag: TTag, row: TRow): ReactElement {
  const value: FieldValue = getValue(tag.value, row);
  return <Tag {...tag.props}>{value}</Tag>;
}

function constructTags(tag: TTags, row: TRow): ReactElement {
  let tags: TTag[] = [];
  if (tag.js) tags = callJSFunction(tag.js, row) as TTag[];
  else tags = tag;

  return (
    <React.Fragment>
      {tags.map((t) => constructSingleTag(t, row))}
    </React.Fragment>
  );
}

function constructRenderCell(c: TColumn, r: TableHookParam) {
  return (dom: any, entity: any): ReactElement => {
    let style: CSS.Properties = {};
    let rendered = dom;
    if (c.addstyle) {
      style = getAddStyle(c.addstyle, entity);
    }

    if (c.value) rendered = getValue(c.value, entity);
    if (c.tags) rendered = constructTags(c.tags, entity);
    if (c.actions) rendered = constructactionsCol(c.actions, entity, r);
    if (c.ident) {
      const ident: number = callJSFunction(c.ident, entity) * 12;
      style.paddingLeft = `${ident}px`;
    }

    if (c.ident || c.addstyle) rendered = <span style={style}>{dom}</span>;

    if (c.showdetails)
      return <a onClick={() => r.fdetails(entity)}>{rendered}</a>;
    else return rendered;
  };
}

function isRenderable(c: TColumn): boolean {
  return (
    c.showdetails !== undefined ||
    c.ident !== undefined ||
    c.value !== undefined ||
    c.tags !== undefined ||
    c.actions !== undefined
  );
}

function sortinc(a: TRow, b: TRow, field: string): number {
  const fielda: string | undefined = a[field] as string | undefined;
  if (fielda === undefined) return 1;
  const fieldb: string = b[field] as string;
  return fielda.localeCompare(fieldb);
}

function sortnumberinc(a: TRow, b: TRow, field: string): number {
  const fielda: number | undefined = a[field] as number | undefined;
  if (fielda === undefined) return 1;
  const fieldb: number = b[field] as number;
  if (fieldb === undefined) return -1;
  return fielda - fieldb;
}

function sortboolinc(a: TRow, b: TRow, field: string): number {
  const fielda: boolean | undefined = a[field] as boolean | undefined;
  if (fielda === undefined) return 1;
  const fieldb: boolean = b[field] as boolean;
  if (fieldb === undefined) return -1;
  if (fielda && fieldb) return 0;
  if (fielda) return 1;
  return -1;
}
function filter(c: TColumn): boolean {
  if (c.nofilter) return false;
  if (c.fieldtype === FIELDTYPE.BOOLEAN) return false;
  if (c.actions) return false;
  if (c.tags) return false;
  return true;
}

function sort(c: TColumn): boolean {
  return filter(c);
}

function transformOneColumn(c: TColumn, r: TableHookParam): ColumnType<any> {
  const mess: string = fieldTitle(c)
  const fieldtype: FIELDTYPE = fieldType(c)
  const p: ColumnType<any> = {};

  if (fieldtype === FIELDTYPE.NUMBER) p.align = "right";
  if (sort(c)) {
    if (c.props === undefined) c.props = {};
    switch (fieldtype) {
      case FIELDTYPE.NUMBER:
        c.props.sorter = (a: TRow, b: TRow) => sortnumberinc(a, b, c.field);
        break;
      case FIELDTYPE.BOOLEAN:
        c.props.sorter = (a: TRow, b: TRow) => sortboolinc(a, b, c.field);
        break;
      default:
        c.props.sorter = (a: TRow, b: TRow) => sortinc(a, b, c.field);
        break;
    }
  }

  const filterprops: ColumnFilterSearch | undefined = filter(c)
    ? TableFilterProps(c, mess)
    : undefined;

  const e: ColumnType<any> = {
    title: <div>{mess}</div>,
    dataIndex: c.field,
    ...p,
    ...c.props,
    ...filterprops,
  };
  if (isRenderable(c)) {
    e.render = constructRenderCell(c, r);
  }

  return e;
}

export function transformColumns(cols: ColumnList, r: TableHookParam): ColumnType<any>[] {
  return cols.columns.map((c) => transformOneColumn(c, r));
}

// =========================================
// message from object
// =========================================

export function makeMessage(
  m: FormMessage,
  row?: TRow,
  vars?: any
): string | undefined {
  if (m.messagedirect) return m.messagedirect;

  if (m.js) {
    const res: any = callJSFunction(m.js, row, vars);
    // recursive !
    return makeMessage(res as FormMessage, row, vars);
  }
  if (m.message) return lstring(m.message, m.params);
  log("makeMessage - incorrect FomrMessage parameter");
  return undefined;
}

// ======================
// find details columns
// ======================
export function findColDetails(c: ColumnList): TColumn | undefined {
  return c.columns.find((x) => x.showdetails);
}

// ======================
// is mask clicked
// ======================
export function ismaskClicked(e: React.MouseEvent<HTMLElement>): boolean {
  const t: string = e.currentTarget.className
  return t === 'ant-modal-wrap'
}

// =====================
// field methods
// =====================

export function fieldType(t: TFieldBase): FIELDTYPE {
  return t.fieldtype ? t.fieldtype : FIELDTYPE.STRING
}

export function fieldTitle(t: TFieldBase): string {
  return lstring(t.coltitle ? t.coltitle : t.field);
}