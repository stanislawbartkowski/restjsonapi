import { ColumnType } from "antd/lib/table";
import React, { ReactNode, useRef } from "react";
import { Badge, Button, Divider, Dropdown, Menu, MenuProps, Space, Statistic, Switch, Tag } from "antd";
import { CSSProperties, ReactElement } from "react";

import lstring from "../../ts/localize";
import { FIELDTYPE, FieldValue, FormMessage, OneRowData, PropsType, TRow } from "../../ts/typing";
import { AddStyle, ButtonAction, ClickResult, ColumnList, StatisticType, TableHookParam, TAction, TActions, TBadge, TColumn, TDivider, TFieldBase, TResizeColumn, TTag, TTags } from "./typing";
import TableFilterProps, { ColumnFilterSearch } from "../TableFilter";
import { clickAction, getValue, isnotdefined } from "./helper";
import { callJSFunction, isNumber, makeMessage } from "../../ts/j";
import defaults from "../../ts/defaults";
import getIcon from '../../ts/icons'
import constructButton from "./constructbutton";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import { EventType } from "@testing-library/react";


// =====================
// field methods
// =====================


export function fieldType(t: TFieldBase): FIELDTYPE {
    return t.fieldtype ? t.fieldtype : FIELDTYPE.STRING
}

export function fieldTitle(t: TFieldBase, pars: OneRowData): string {
    if (t.coltitle === undefined) return lstring(t.field);
    // 2022/06/24 -- commented out    
    //    if (isString(t.coltitle)) return lstring(t.coltitle as string)
    const m: FormMessage = t.coltitle as FormMessage
    return makeMessage(m, pars) as string

}


// ====================================
// sort filter procs
// ====================================

function sortinc(a: TRow, b: TRow, field: string): number {
    const fielda: string | undefined = a[field] as string | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: string = b[field] as string;
    return (fielda as string).localeCompare(fieldb);
}

function sortnumberinc(a: TRow, b: TRow, field: string): number {
    const fielda: number | undefined = a[field] as number | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: number = b[field] as number;
    if (isnotdefined(fieldb)) return -1;
    return (fielda as number) - fieldb;
}

function sortboolinc(a: TRow, b: TRow, field: string): number {
    const fielda: boolean | undefined = a[field] as boolean | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: boolean = b[field] as boolean;
    if (isnotdefined(fieldb)) return -1;
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
    const res: TAction = clickAction(t, pars);
    if (r.fresult) r.fresult(pars.r, res);
}

function genButtonFromAction(t: TAction, key: number): ButtonAction {
    const props: PropsType = { style: { padding: "0px" }, type: "link" }
    const b: ButtonAction = { ...t, id: (key as any) as string, name: (t as FormMessage), props: { ...props, ...t.props } }
    return b
}

function constructAction(key: number, t: TAction, r: TableHookParam, pars: OneRowData): ReactNode {

    const b: ButtonAction = t.button ? t.button as ButtonAction : genButtonFromAction(t, key)

    return constructButton(b, () => clickActionHook(t, r, pars));
}

export interface IActionHook {
    onClick: () => void,
    text: string | undefined
}

export function getActions(a: TActions, pars: OneRowData): TActions {
    let act: TActions = a
    if (a.js) act = callJSFunction(a.js as string, pars);
    return act
}

export function extractActionHook(t: TAction, r: TableHookParam, pars: OneRowData): IActionHook {

    return {
        onClick: () => clickActionHook(t, r, pars),
        text: makeMessage(t, pars)
    }
}


function constructMenuAction(key: number, t: TAction, r: TableHookParam, pars: OneRowData): ItemType {
    const h: IActionHook = extractActionHook(t, r, pars)
    const ic = t.icon ? { icon: getIcon(t.icon) } : {}
    return { key: key, label: h.text, onClick: h.onClick };
}

export function constructactionsCol(a: TActions, r: TableHookParam, pars: OneRowData): ReactElement | undefined {
    let numb: number = 0
    const act = getActions(a, pars)
    if (act === undefined) return undefined
    const actions: TAction[] = act.actions as TAction[]
    if (actions.length === 0) return undefined

    if (act.dropdown) {
        const items: MenuProps['items'] = actions.map(e => constructMenuAction(numb++, e, r, pars))
        return (
            <Dropdown menu={{ items }}  >
                <Button {...act.dprops} icon={getIcon('moreoutlined')}></Button>
            </Dropdown>
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

function constructBoolean(c: TColumn, r: TRow, vars?: TRow, disabled?: boolean): ReactElement {
    const checked: boolean = r[c.field] as boolean
    return <Switch checked={checked} disabled={disabled} />
}

export function getVal(c: TColumn, props: OneRowData): FieldValue {
    const val: FieldValue = (props.r as TRow)[c.field]
    if (val) return val
    return (props.vars) ? props.vars[c.field] : undefined
}


export function renderCell(c: TColumn, dom: any, r: TRow, rhook: TableHookParam, vars?: TRow, disabled?: boolean): ReactElement {
    let style: CSSProperties = {};
    let rendered = dom;
    const parms: OneRowData = { r: r, vars: vars }

    if (c.addstyle) {
        style = getAddStyle(c.addstyle, parms);
    }

    if (c.stat) rendered = makeStatItem(c.stat, parms)

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
    if (c.fieldtype === FIELDTYPE.BOOLEAN) return constructBoolean(c, r, vars, disabled);
    if (c.fieldtype === FIELDTYPE.HTML) return HTMLElem(getVal(c, parms) as string);
    return rendered;

}


function constructRenderCell(c: TColumn, r: TableHookParam, vars?: TRow) {
    // 2022/08/17 {...entity} added
    return (dom: any, entity: TRow): ReactElement => { return renderCell(c, dom, { ...entity }, r, vars) }
};

// =============================  

export function modifyColProps(c: TColumn, p: ColumnType<any>) {
    if (p.align !== undefined) return;
    const fieldtype: FIELDTYPE = fieldType(c)
    if (fieldtype === FIELDTYPE.NUMBER || fieldtype === FIELDTYPE.MONEY) p.align = "right";
}

function isRenderable(c: TColumn): boolean {
    return (
        c.showdetails !== undefined ||
        c.ident !== undefined ||
        c.tags !== undefined ||
        c.actions !== undefined ||
        c.badge !== undefined ||
        c.stat !== undefined ||
        c.addstyle !== undefined ||
        c.fieldtype === FIELDTYPE.BOOLEAN
    );
}

// ====================
// transform column
// ====================

export function transformOneColumn(c: TColumn, r: TableHookParam, cols: ColumnList, vars?: TRow, width?: number | string, resizeF?: TResizeColumn): ColumnType<any> {
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

    const handleResize = (e: any, { size }: any) => {
        if (resizeF === undefined) return;
        resizeF(c, size.width as number)
    };

    const widthProp = (width === undefined) ? undefined : { width: width }
    const onHeaderProps = (resizeF !== undefined && width !== undefined && isNumber(width)) ? {
        onHeaderCell: (column: any) => {
            return {
                width: width as number,
                onResize: handleResize
            }
        }
    } : undefined

    const e: ColumnType<any> = {
        title: <div>{mess}</div>,
        dataIndex: c.field,
        ...p,
        ...c.props,
        ...filterprops,
        ...widthProp,
        ...onHeaderProps
    };
    if (isRenderable(c)) {
        e.render = constructRenderCell(c, r, vars);
    }

    return e;
}


// =========================
// divider 
// =========================

export function makeDivider(d: TDivider, t: OneRowData): React.ReactElement {
    return <Divider {...d.props}>{makeMessage(d as FormMessage, { r: t.r, vars: t.vars })}</Divider>
}

// =========================
// HTML content
// =========================

export function HTMLElem(value: string | undefined): React.ReactElement {

    const html: string = value ? value as string : ""
    return <div dangerouslySetInnerHTML={{ __html: html }} />
}


// ===================
// stat 
// ===================

export function makeStatItem(stat: StatisticType, t: OneRowData): React.ReactNode {
    const st: StatisticType = stat.js ? callJSFunction(stat.js as string, t) : stat
    const icon = st.icon ? { prefix: getIcon(st.icon) } : undefined
    const title: string = makeMessage(st.title, t) as string
    const valuestyle = st.valueStyle ? { valueStyle: st.valueStyle } : undefined
    const props: PropsType = { precision: defaults.moneydot, ...st.props }
    return <Statistic title={title} {...icon} value={st.value as string | number} {...props} {...valuestyle} ></Statistic>
}
