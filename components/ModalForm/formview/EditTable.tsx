import { Card, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import React, { ReactElement, ReactNode } from 'react';

import { ButtonElem, TRow, RowData } from '../../../ts/typing';
import SummaryTable from '../../SummaryTable';
import { constructButtonElem } from '../../ts/constructbutton';
import { genColIdedit, getEditList, cardProps } from '../../ts/helper';
import { addRowKey } from '../../ts/tranformlist';
import { constructactionsCol, fieldTitle } from '../../ts/transcol';
import { TableHookParam, TAction, TActions, TField, ButtonAction, ColumnList, TColumns } from '../../ts/typing';
import { produceFormItem } from './EditItems';
import { ErrorMessages, FField, IFieldContext, ROWKEY } from './types';


function genAddButton(it: IFieldContext, c: FField) {

    if (c.editlist?.addbutton === undefined) return undefined
    const addButton: ButtonElem = c.editlist.addbutton
    if (addButton.icon === undefined) addButton.icon = "pluscircleoutlined"
    const b = constructButtonElem(addButton, it.clickButton)
    return b
}

function constructRenderAction(it: IFieldContext, c: FField, err: ErrorMessages, editid: string, vars?: TRow) {
    const h: TableHookParam = {
        fresult: (entity: TRow, r: TAction) => {
            it.clickButton(r as ButtonAction, entity)
        }
    }
    return (dom: any, entity: TRow): ReactElement => {
        return constructactionsCol(c.actions as TActions, h, { r: entity }) as ReactElement
    }
}


function constructRenderCell(it: IFieldContext, c: FField, err: ErrorMessages, editid: string, vars?: TRow) {
    return (dom: any, entity: TRow): ReactElement => {
        return <React.Fragment><span className='listedit'>{produceFormItem(it, { ...c, coltitle: "empty", field: genColIdedit(editid, c.field, entity[ROWKEY] as number) }, err, undefined)}</span></React.Fragment>
    }
};

function contructColumn(it: IFieldContext, t: FField, editid: string, err: ErrorMessages): ColumnType<any> {
    const mess: string = fieldTitle(t, { r: {} });
    return {
        title: <React.Fragment>{mess}</React.Fragment>,
        dataIndex: t.field,
        render: t.actions ? constructRenderAction(it, t, err, editid) : constructRenderCell(it, t, err, editid)
    }
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


    const fpart = {
        searchF: t.searchF,
        multiF: t.multiF,
        tableR: t.tableR,
        setvarsaction: t.setvarsaction,
        listfield: t.listfield,
        groupT: t.groupT,
        editTRow: t.editTRow
    }

    const vars: TRow = ir.getValues()

    const columns: ColumnType<any>[] = items.map(c => contructColumn(ir, { ...fpart, ...c }, editid, err))

    const cols: TColumns = fieldsToColumns(items)

    function clickedRow(r: TRow) {
        const rowkey: number = r[ROWKEY] as number
        t.editTRow.set(t.field, rowkey)
    }

    return <Card bordered {...cardProps(t.editlist?.card)} extra={genAddButton(ir, t)}>
        <Table
            columns={columns}
            dataSource={values}
            onRow={(r, i) => { return { onClick: (event) => clickedRow(r) } }}
            summary={isSummary() ? () => (<SummaryTable isextendable={false} vars={vars} columns={cols} summary={t.editlist?.summary} list={values} />) : undefined}
        />
    </Card>

}