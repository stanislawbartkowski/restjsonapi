import { ColumnType } from "antd/lib/table";
import React from "react";
import { Badge, Button, Dropdown, Menu, Space, Tag } from "antd";
import { CSSProperties, ReactElement } from "react";

import lstring from "../../ts/localize";
import { FIELDTYPE, FieldValue, FormMessage, OneRowData, TRow } from "../../ts/typing";
import { AddStyle, ClickResult, ColumnList, TableHookParam, TAction, TActions, TBadge, TColumn, TFieldBase, TTag, TTags } from "./typing";
import TableFilterProps, { ColumnFilterSearch } from "../TableFilter";
import { clickAction, getValue } from "./helper";
import { callJSFunction, isString, makeMessage } from "../../ts/j";
import defaults from "../../ts/defaults";
import getIcon from '../../ts/icons'


// =====================
// field methods
// =====================


export function fieldType(t: TFieldBase): FIELDTYPE {
    return t.fieldtype ? t.fieldtype : FIELDTYPE.STRING
}

export function fieldTitle(t: TFieldBase, pars: OneRowData): string {
    if (t.coltitle === undefined) return lstring(t.field);
    if (isString(t.coltitle)) return lstring(t.coltitle as string)
    const m: FormMessage = t.coltitle as FormMessage
    return makeMessage(m, pars) as string

}


// ====================================
// sort filter procs
// ====================================

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

function sortfilter(c: TColumn): boolean {
    if (c.fieldtype === FIELDTYPE.BOOLEAN) return false;
    if (c.actions) return false;
    if (c.tags) return false;
    return true;
}

function filter(c: TColumn, cols: ColumnList): boolean {
    if (cols.nofilter || c.nofilter) return false;
    return sortfilter(c)
}

function sort(c: TColumn, cols: ColumnList): boolean {
    if (cols.nosort || c.nosort) return false;
    return sortfilter(c)
}

// ==============================
// render cell
// ==============================

function clickActionHook(t: TAction, r: TableHookParam, pars: OneRowData) {
    const res: ClickResult = clickAction(t, pars);
    if (r.fresult) r.fresult(pars.r, res);
}

function constructAction(key: number, t: TAction, r: TableHookParam, pars: OneRowData): ReactElement {
    return (
        <Button style={{ padding: 0 }} type="link" key={key} onClick={() => clickActionHook(t, r, pars)}>{makeMessage(t, pars)}</Button>
    );
}


function constructMenuAction(key: number, t: TAction, r: TableHookParam, pars: OneRowData): ReactElement {
    return (
        <Menu.Item key={key} onClick={() => clickActionHook(t, r, pars)}>{makeMessage(t, pars)}</Menu.Item>
    );
}

function constructactionsCol(a: TActions, r: TableHookParam, pars: OneRowData): ReactElement | undefined {
    let act: TActions = a
    let numb: number = 0
    if (a.js) act = callJSFunction(a.js as string, pars);
    if (act === undefined) return undefined
    const actions: TAction[] = act.actions as TAction[]
    if (actions === undefined) return undefined
    if (act.dropdown) {
        const menu = (
            <Menu>
                {actions.map(e => constructMenuAction(numb++, e, r, pars))}
            </Menu>
        );
        return (
            <Dropdown.Button icon={getIcon('moreoutlined')} overlay={menu}>
            </Dropdown.Button>
        )
    }
    return (
        <Space size="middle">{actions.map((t) => constructAction(numb++, t, r, pars))}</Space>
    );


}


function getAddStyle(a: AddStyle, pars: OneRowData): CSSProperties {
    if (a.style) return a.style;
    const s: CSSProperties = callJSFunction(a.js as string, pars);
    return s ? s : {}
}

function constructSingleTag(key: number, tag: TTag, r: TableHookParam, pars: OneRowData): ReactElement {
    const value: FieldValue = getValue(tag.value, pars);

    const p = (tag.action && r.fresult !== undefined) ? { className: 'tagbutton' } : {}

    return <Tag key={key}
        onClick={() => { if (tag.action) clickActionHook(tag.action, r, pars) }}
        {...p} {...tag.props} >{value}</Tag>;
}



function constructTags(tag: TTags, r: TableHookParam, pars: OneRowData): ReactElement {
    let tags: TTag[] = [];
    if (tag.js) tags = callJSFunction(tag.js, pars) as TTag[];
    else tags = tag;
    let key: number = 0

    return (
        <React.Fragment>
            {tags.map((t) => constructSingleTag(key++, t, r, pars))}
        </React.Fragment>
    );
}


function constructBadge(badge: TBadge, pars: OneRowData): ReactElement {
    const ba: TBadge = badge.js ? callJSFunction(badge.js, pars) : badge
    const title: string | undefined = ba.title ? makeMessage(ba.title, pars) : undefined
    return <Badge title={title} {...ba.props} />
}

export function renderCell(c: TColumn, dom: any, r: TRow, rhook: TableHookParam, vars?: TRow): ReactElement {
    let style: CSSProperties = {};
    let rendered = dom;
    const parms = { r: r, vars: vars }
    if (c.addstyle) {
        style = getAddStyle(c.addstyle, parms);
    }


    if (c.tags) rendered = constructTags(c.tags, rhook, parms);
    if (c.actions && rhook.fresult) rendered = constructactionsCol(c.actions, rhook, parms);
    if (c.ident) {
        const ident: number = callJSFunction(c.ident, parms) * defaults.identmul;
        style.paddingLeft = `${ident}px`;
    }

    const badgeC: ReactElement | undefined = c.badge ? constructBadge(c.badge, parms) : undefined

    if (c.ident || c.addstyle || c.badge) rendered = <span style={style}>{badgeC} {dom}</span>;

    if (c.showdetails && rhook.fdetails !== undefined)
        return <Button type="link" onClick={() => { if (rhook.fdetails) rhook.fdetails(r) }}>{rendered}</Button>;
    else return rendered;

}


function constructRenderCell(c: TColumn, r: TableHookParam, vars?: TRow) {
    return (dom: any, entity: TRow): ReactElement => { return renderCell(c, dom, entity, r, vars) }
};

// =============================  

export function modifyColProps(c: TColumn, p: ColumnType<any>) {
    const fieldtype: FIELDTYPE = fieldType(c)
    if (fieldtype === FIELDTYPE.NUMBER || fieldtype === FIELDTYPE.MONEY) p.align = "right";
}

function isRenderable(c: TColumn): boolean {
    return (
        c.showdetails !== undefined ||
        c.ident !== undefined ||
        c.tags !== undefined ||
        c.actions !== undefined ||
        c.badge !== undefined
    );
}

// ====================
// transform column
// ====================

export function transformOneColumn(c: TColumn, r: TableHookParam, cols: ColumnList, vars?: TRow): ColumnType<any> {
    const mess: string = fieldTitle(c, { r: {}, vars: vars })
    const fieldtype: FIELDTYPE = fieldType(c)
    const p: ColumnType<any> = {};

    modifyColProps(c, p);
    if (sort(c, cols)) {
        if (c.props === undefined) c.props = {};
        switch (fieldtype) {
            case FIELDTYPE.NUMBER:
            case FIELDTYPE.MONEY:
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

    const filterprops: ColumnFilterSearch | undefined = filter(c, cols)
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
        e.render = constructRenderCell(c, r, vars);
    }

    return e;
}
