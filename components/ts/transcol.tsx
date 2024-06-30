import { ColumnType, ColumnsType } from "antd/lib/table";
import { GetComponentProps } from 'rc-table/lib/interface'
import React, { ReactNode } from "react";
import { Badge, Button, Divider, Dropdown, MenuProps, Space, Statistic, Switch, Tag } from "antd";
import { CSSProperties, ReactElement } from "react";
//import { ItemType } from "antd/lib/menu/hooks/useItems";

import lstring from "../../ts/localize";
import { FIELDTYPE, FieldValue, FormMessage, OneRowData, PropsType, TRow } from "../../ts/typing";
import { AddStyle, ButtonAction, ColumnList, ColumnSortType, IColumnFilter, IColumnSort, StatisticType, TableHookParam, TAction, TActions, TBadge, TColumn, TDivider, TFieldBase, TResizeColumn, TTag, TTags } from "./typing";
import TableFilterProps, { ColumnFilterSearch } from "../TableFilter";
import { clickAction, getValue, getafterdot, istrue, stoint, tomoney, } from "./helper";
import { callJSFunction, isNumber, isnotdefined, makeMessage } from "../../ts/j";
import defaults from "../../ts/defaults";
import getIcon from '../../ts/icons'
import constructButton from "./constructbutton";
import { sortboolinc, sortinc, sortnumberinc } from "../../ts/sortproc";
import { ItemType } from "antd/lib/menu/interface";


// =====================
// field methods
// =====================


export function fieldType(t: TFieldBase): FIELDTYPE {
    return t.fieldtype ? t.fieldtype : FIELDTYPE.STRING
}

export function fieldTitle(t: TFieldBase, pars: OneRowData): string {
    if (isnotdefined(t.coltitle)) return lstring(t.field);
    // 2022/06/24 -- commented out    
    //    if (isString(t.coltitle)) return lstring(t.coltitle as string)
    const m: FormMessage = t.coltitle as FormMessage
    return makeMessage(m, pars) as string

}


// ====================================
// sort filter procs
// ====================================


function sortfilter(c: TColumn): boolean {
    if (c.fieldtype === FIELDTYPE.BOOLEAN) return false;
    if (c.fieldtype === FIELDTYPE.HTML) return false;
    if (c.actions) {
        return istrue(c.actions.showindetails)
    }
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
        {...p} {...tag.props} >{value as string}</Tag>;
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
    // 2023/08/10 -- important, distinguish between undefined and null
    if (val !== undefined) return val
    // only in case of undefined use props.vars
    return (props.vars) ? props.vars[c.field] : undefined
}

function constructInt(c: TColumn, r: TRow): ReactElement {
    const val: FieldValue = (r as TRow)[c.field]
    const num: number = stoint(val)
    return <div>{num}</div>
}

function moneydot(c: TColumn, props: OneRowData): number {
    const vars: TRow | undefined = props.vars
    if (c.moneydot !== undefined) {
        if (vars === undefined) return defaults.moneydot
        const moneydot: string | undefined = vars[defaults.moneydotvar] as string
        return getafterdot(c.moneydot, moneydot)
    }
    if (c.moneydotcol !== undefined) {
        const afterdot: number | undefined = (props.r[c.moneydotcol] as number)
        if (afterdot !== undefined) return afterdot
    }
    return defaults.moneydot
}


function constructMoney(dom: any, c: TColumn, r: TRow, vars?: TRow): ReactElement {
    const val: number | undefined = (r as TRow)[c.field] as number
    if (val === undefined) return dom

    const num = tomoney(val, moneydot(c, { r: r, vars: vars }))
    return <div>{num}</div>
}


export function renderCell(c: TColumn, dom: any, r: TRow, rhook: TableHookParam, vars?: TRow, disabled?: boolean): ReactElement {
    let style: CSSProperties = {};
    let rendered = dom;
    const parms: OneRowData = { r: r, vars: vars }

    if (c.addstyle) {
        style = getAddStyle(c.addstyle, parms);
    }

    if (c.stat) rendered = makeStatItem(fieldType(c), c.stat, parms)

    if (c.tags) rendered = constructTags(c.tags, rhook, parms);
    if (c.actions && rhook.fresult) rendered = constructactionsCol(c.actions, rhook, parms);
    if (c.ident) {
        const ident: number = callJSFunction(c.ident, parms) * defaults.identmul;
        style.paddingLeft = `${ident}px`;
    }

    const badgeC: ReactElement | undefined = c.badge ? constructBadge(c.badge, parms) : undefined

    if (c.ident || c.addstyle || c.badge) rendered = <span style={style}>{badgeC} {dom}</span>;

    if (c.stat === undefined) {
        if (c.fieldtype === FIELDTYPE.INT) rendered = constructInt(c, r)
        if (c.fieldtype === FIELDTYPE.MONEY) rendered = constructMoney(dom, c, r, vars)
    }

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
    if (fieldtype === FIELDTYPE.NUMBER || fieldtype === FIELDTYPE.MONEY || fieldtype === FIELDTYPE.INT) p.align = "right";
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
        c.fieldtype === FIELDTYPE.BOOLEAN ||
        c.fieldtype === FIELDTYPE.INT ||
        (c.fieldtype === FIELDTYPE.MONEY)
    );
}

// ====================
// transform column
// ====================

export function transformOneColumn(c: TColumn, r: TableHookParam, cols: ColumnList, vars?: TRow, width?: number | string, resizeF?: TResizeColumn, sortColumn?: IColumnSort, filterF?: IColumnFilter): ColumnType<any> {
    const mess: string = fieldTitle(c, { r: {}, vars: vars })
    const fieldtype: FIELDTYPE = fieldType(c)
    const p: ColumnType<any> = {};

    modifyColProps(c, p);
    if (sort(c, cols)) {
        if (c.props === undefined) c.props = {};
        switch (fieldtype) {
            case FIELDTYPE.NUMBER:
            case FIELDTYPE.MONEY:
            case FIELDTYPE.INT:
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
        ? TableFilterProps(c, mess, filterF)
        : undefined;

    const handleResize = (e: any, { size }: any) => {
        if (resizeF === undefined) return;
        resizeF(c, size.width as number)
    };

    const widthProp = (width === undefined) ? undefined : { width: width }

    const isresize: boolean = (resizeF !== undefined && width !== undefined && isNumber(width))
    const issort: boolean = sortColumn !== undefined

    const headerFunc: GetComponentProps<ColumnsType<any>[number]> = (column: any) => {
        const presize = isresize ? {
            width: width as number,
            onResize: handleResize
        } : undefined
        const sort = issort ? {
            onClick: () => {
                const colu = (column as any)
                if (colu.title.props.children.props === undefined) return
                const sort: string = colu.title.props.children.props.title as string
                const locale = colu.title.props.locale
                const sortType: ColumnSortType = sort === locale.triggerAsc ? ColumnSortType.ACC : sort === locale.triggerDesc ? ColumnSortType.DESC : ColumnSortType.NO
                sortColumn?.changeSort(c, sortType)
            }
        } : undefined
        return { ...presize, ...sort } as React.HTMLAttributes<any>
    }


    const onHeaderProps = (isresize || issort) ? {
        onHeaderCell: headerFunc
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

    if (issort) {
        const sort: ColumnSortType = (sortColumn as IColumnSort).getSort(c)
        if (sort !== ColumnSortType.NO) {
            e.defaultSortOrder = sort == ColumnSortType.ACC ? "ascend" : "descend"
        }
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

    const html: string = value ?? ""
    return <span dangerouslySetInnerHTML={{ __html: html }} />
}


// ===================
// stat 
// ===================

function getStatVal(fieldtype: FIELDTYPE, st: StatisticType, t: OneRowData): number | string | undefined {
    if (fieldtype !== FIELDTYPE.MONEY) return st.value as string
    if (st.value === undefined) return undefined
    const val = st.value as number
    const mval = tomoney(val, defaults.moneydot)
    return mval;
}

export function makeStatItem(fieldtype: FIELDTYPE, stat: StatisticType, t: OneRowData): React.ReactNode {
    const st: StatisticType = stat.js ? callJSFunction(stat.js as string, t) : stat
    const icon = st.icon ? { prefix: getIcon(st.icon) } : undefined
    const title: string = makeMessage(st.title, t) as string
    const valuestyle = st.valueStyle ? { valueStyle: st.valueStyle } : undefined
    const props: PropsType = { precision: defaults.moneydot, ...st.props }


    return <Statistic title={title} {...icon} value={getStatVal(fieldtype, st, t)} {...props} {...valuestyle} ></Statistic>
}
