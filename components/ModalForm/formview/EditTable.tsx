import { Card, Divider, PaginationProps, Space, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import React, { ReactElement, ReactNode } from 'react';

import { ButtonElem, TRow, RowData, OneRowData } from '../../../ts/typing';
import SummaryTable from '../../SummaryTable';
import { constructButtonElem } from '../../ts/constructbutton';
import { genColIdedit, getEditList, cardProps, visibleColumns, istrue } from '../../ts/helper';
import { addRowKey } from '../../ts/tranformlist';
import { constructactionsCol, fieldTitle, transformOneColumn } from '../../ts/transcol';
import { TableHookParam, TAction, TActions, TField, ButtonAction, TColumns, TClickButton, TColumn, ColumnList } from '../../ts/typing';
import { produceFormItem } from './EditItems';
import { ErrorMessages, FField, FGenEditId, IFieldContext, ROWKEY, TOptions } from './types';
import propsPaging from "../../ts/tablepaging"
import { trace } from '../../../ts/l';
import { getFieldProps, getPars } from './helper';

function ltrace(mess: string) {
    trace('EditTable', mess)
}


function genAddButton(it: IFieldContext, c: FField) {

    if (c.editlist?.addbutton === undefined) return undefined
    const addButton: ButtonElem = c.editlist.addbutton
    if (addButton.icon === undefined) addButton.icon = "pluscircleoutlined"
    const pars: OneRowData = getPars(it)
    const b = constructButtonElem(addButton, it.clickButton, pars)
    if (c.editlist.buttons === undefined) return b
    const buttons: ReactNode[] = c.editlist.buttons.map(e => constructButtonElem(e, it.clickButton, pars))
    return <Space size="small">{buttons}{<Divider type="vertical" />}{b}</Space>
}

function createHookParam(it: IFieldContext): TableHookParam {
    const h: TableHookParam = {
        fresult: (entity: TRow, r: TAction) => {
            it.clickButton(r as ButtonAction, entity)
        }
    }
    return h
}

function constructRenderAction(it: IFieldContext, c: FField, err: ErrorMessages, editid: string, vars?: TRow) {
    const h: TableHookParam = createHookParam(it);
    return (dom: any, entity: TRow): ReactElement => {
        return constructactionsCol(c.actions as TActions, h, { r: entity }) as ReactElement
    }
}

function findACol(t: TField, fieldprops: TField[]): TField | undefined {
    if (fieldprops === undefined) return undefined
    return fieldprops.find(tt => t.field === tt.field)
}

function constructRenderCell(it: IFieldContext, c: FField, err: ErrorMessages, editid: string, options: TOptions, vars: TRow | undefined, fieldprops: TField[]) {
    const f: TField | undefined = findACol(c, fieldprops)
    const disabled = f !== undefined && istrue(f.disabled) ? { disabled: true } : undefined
    return (dom: any, entity: TRow): ReactElement => {
        const gId: FGenEditId = (id: string) => genColIdedit(editid, id, entity[ROWKEY] as number)
        return <React.Fragment><span className='listedit'>{produceFormItem(it, { ...c, coltitle: "empty", ...disabled, field: gId(c.field), genId: gId, options: options }, err, undefined)}</span></React.Fragment>
    }
};

function createTitle(t: TField, fieldprops: TField[]): string {
    const f: TField | undefined = findACol(t, fieldprops)
    return f === undefined || f.coltitle === undefined ? fieldTitle(t, { r: {} }) : fieldTitle(f, { r: {} })
}

function constructTColumn(it: IFieldContext, t: FField, editid: string, err: ErrorMessages, options: TOptions, vars: TRow, fieldprops: TField[]): ColumnType<any> {
    const mess: string = createTitle(t, fieldprops)
    const width = (t.colwidth === undefined) ? undefined : { 'width': t.colwidth }
    return {
        title: <React.Fragment>{mess}</React.Fragment>,
        dataIndex: t.field,
        ...t.props,
        ...width,
        render: t.actions ? constructRenderAction(it, t, err, editid) : constructRenderCell(it, t, err, editid, options, undefined, fieldprops)
    }
}

function contructCColumn(it: IFieldContext, t: FField, editid: string, err: ErrorMessages, vars: TRow, fieldprops: TField[]): ColumnType<any> {

    const f: TField | undefined = findACol(t, fieldprops)
    const title = (f === undefined) ? undefined : { coltitle: { messagedirect: fieldTitle(f, { r: {} }) } }
    const col: TColumn = { ...t.col as TColumn, ...title }
    col.field = t.field
    const h: TableHookParam = createHookParam(it);
    const colu: ColumnList = {
        nosort: true,
        nofilter: true,
        columns: []
    }
    return transformOneColumn(col, h, colu, vars)
}


function contructColumn(it: IFieldContext, t: FField, editid: string, err: ErrorMessages, options: TOptions, vars: TRow, fieldprops: TField[]): ColumnType<any> {
    return t.col ? contructCColumn(it, t, editid, err, vars, fieldprops) : constructTColumn(it, t, editid, err, options, vars, fieldprops)
}


function fieldsToColumns(fields: TField[]): TColumns {
    return fields.map(t => t)
}

export function produceEditTable(ir: IFieldContext, t: FField, err: ErrorMessages): ReactNode {

    const items: TField[] = t.items as TField[]

    const r: TRow = ir.getValues()

    const editid: string = t.field

    const values: RowData = getEditList(editid, r) as RowData

    addRowKey(values, ROWKEY)

    function isSummary(): boolean {
        return t.editlist?.summary !== undefined
    }

    const clickB: TClickButton = (clickbutton?: ButtonAction, row?: TRow) => {
        const rr: TRow = row as TRow
        clickedRow(rr)
        ir.clickButton(clickbutton, row)
    }

    const irC: IFieldContext = {
        ...ir,
        clickButton: clickB
    }


    const fpart = {
        searchF: t.searchF,
        multiF: t.multiF,
        tableR: t.tableR,
        setvarsaction: t.setvarsaction,
        setinitvarsaction: t.setinitvarsaction,
        listfield: t.listfield,
        groupT: t.groupT,
        seteditRow: t.seteditRow,
        rerenderD: t.rerenderD
    }

    const vars: TRow = ir.getValues()

    const aprops: TField[] | undefined = getFieldProps(ir, t) as TField[]

    const columns: ColumnType<any>[] = items.map(c => contructColumn(irC, { ...fpart, ...c }, editid, err, t.options as TOptions, vars, aprops))

    const cols: TColumns = fieldsToColumns(items)

    function clickedRow(r: TRow) {
        const rowkey: number = r[ROWKEY] as number
        ltrace(`Clicked row ${rowkey}`)
        t.seteditRow(t.field, rowkey)
    }

    const onChange: PaginationProps['onChange'] = (pageNumber) => {
        t.rerenderD()
    };

    const pagination = propsPaging(t.editlist, values ? values.length : 0)[0]
    if (pagination.pagination) {
        pagination.pagination.onChange = onChange
    }

    return <Card bordered {...cardProps(t.editlist?.card)} extra={genAddButton(ir, t)}>
        <Table
            {...pagination}
            columns={columns}
            dataSource={values}
            onRow={(r, i) => { return { onClick: (event) => clickedRow(r) } }}
            summary={isSummary() ? () => (<SummaryTable isextendable={false} vars={vars} columns={visibleColumns(cols)} summary={t.editlist?.summary} list={values} />) : undefined}
        />
    </Card>

}