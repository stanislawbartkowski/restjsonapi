import React, { useState, useEffect } from "react";

import type { ColumnType } from "antd/lib/table";
import { Table, Drawer, Space, Divider } from "antd";
import type { TableRowSelection } from "antd/lib/table/interface";

import lstring from "../../ts/localize";
import { ClickActionProps, emptyModalListProps, FieldValue, ModalFormProps, OneRowData, PropsType, RestTableParam, RowData, TRow } from "../../ts/typing";
import type { TExtendable, } from "./typing";
import type { ButtonAction, ClickResult, ColumnList, FActionResult, FShowDetails, ShowDetails, TAsyncRestCall, TColumn } from "../ts/typing";
import { Status } from "../ts/typing";
import { transformColumns, filterDataSource, filterDataSourceButton } from "./js/helper";
import { findColDetails, makeHeader } from "../ts/helper";
import ModalList from "../RestComponent";
import getExtendableProps from "./Expendable";
import HeaderTable from "../HeaderTable";
import readlist, { DataSourceState } from '../ts/readlist'
import ReadListError from '../errors/ReadListError'
import SummaryTable from './SummaryTable'
import defaults from "../../ts/defaults";
import { isNumber } from "../../ts/j";
import OneRowTable from "../ShowDetails/OneRowTable"
import SearchButton, { FSetFilter } from "./SearchButton";
import { ExtendedFilter, noExtendedFilter } from "./SearchButton/SearchExtended";

function propsPaging(props: RestTableParam & ColumnList, dsize: number): undefined | PropsType {
    let pageSize: number | undefined = props.pageSize ? props.pageSize : defaults.defpageSize
    let nopaging: boolean = false;
    if (props.nopaging) {
        if (isNumber(props.nopaging)) {
            const ps: number = props.nopaging as number
            if (dsize <= ps) nopaging = true
            else pageSize = ps
        }
        else nopaging = true;
    }

    return nopaging ? { pagination: false } : { pagination: { defaultPageSize: pageSize } }
}

function tranformtoSel(sel: FieldValue[] | undefined): (string | number)[] {
    if (sel === undefined) return []
    return sel.map((e: FieldValue) => isNumber(e) ? e as number : e as string)
}

const RestTableView: React.FC<RestTableParam & ColumnList & ClickActionProps & { refreshno?: number }> = (props) => {

    const [extendedFilter, setExtendedFilter] = useState<ExtendedFilter>(noExtendedFilter)

    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<TRow>();
    const [multichoice, setMultiChoice] = useState<FieldValue[]>(props.initsel as FieldValue[])


    const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);
    const [datasource, setDataSource] = useState<DataSourceState>({
        status: Status.PENDING,
        res: [],
    });

    const [refreshnumber, setRefreshNumber] = useState<number>(0);


    const f: FShowDetails = (entity: TRow) => {
        setCurrentRow(entity);
        setShowDetail(true);
    };

    const fmodalhook = (): void => {
        setIsModalVisible({ visible: false });
    };

    const fresult: FActionResult = (entity: TRow, r: ClickResult) => {
        setIsModalVisible({
            visible: true,
            closeAction: fmodalhook,
            vars: entity,
            ...r,
        });
    };

    const columns: ColumnType<any>[] = transformColumns(props, {
        fdetails: f,
        fresult: fresult,
    }, props.vars);

    function toPars(): OneRowData {
        return { vars: props.vars, r: {}, t: datasource.res }
    }

    const title = makeHeader(props, lstring("empty"), toPars())

    useEffect(() => readlist(props, (s: DataSourceState) => { setDataSource({ ...s }) })
        , [props.list, props.listdef, refreshnumber, props.refreshno]);


    const extend: TExtendable | undefined = props.extendable
        ? getExtendableProps(props, props.vars)
        : undefined;

    function refreshtable() {
        setRefreshNumber(refreshnumber + 1)
    }

    const refreshFilter: FSetFilter = (p: ExtendedFilter) => {
        setExtendedFilter({ isfilter: p.isfilter, filtervalues: JSON.parse(JSON.stringify(p.filtervalues)) })
    }

    if (datasource.status === Status.ERROR) return <ReadListError />

    function isSummary(): boolean {
        return props.summary !== undefined
    }

    if (props.onerow) {
        return <OneRowTable {...props} r={datasource.res.length === 0 ? {} : datasource.res[0]} />
    }

    const ddsource: RowData = props.filterJS ? filterDataSource(props, { r: {}, t: datasource.res, vars: props.vars }) : datasource.res

    const dsource: RowData = filterDataSourceButton(props, ddsource, extendedFilter)

    if (props.onTableRead) props.onTableRead({ res: dsource, vars: datasource.vars });

    const paging = propsPaging(props, dsource.length)


    function buttonAction(b?: ButtonAction, r?: TRow) {
        if (b === undefined || props.closeAction === undefined) return;
        props.closeAction(b, { ...currentRow, ...r });
    }

    function findRowByKey(key: React.Key): TRow | undefined {
        const k = datasource.rowkey
        if (k === undefined) return undefined
        return datasource.res.find(r => r[k] === key)
    }

    function rowSelection(t: RestTableParam): { rowSelection: TableRowSelection<TRow> } | undefined {

        return (t.choosing || props.multiselect) ? {
            rowSelection: {
                type: t.choosing ? 'radio' : 'checkbox',
                onChange: (r: React.Key[]) => {
                    // if (props.multiSelect) props.multiSelect(r)
                    setMultiChoice(r)
                    if (r.length > 0) {
                        const key: React.Key = r[0]
                        console.log(key)
                        const ro: TRow | undefined = findRowByKey(key);
                        if (ro) setCurrentRow(ro)
                    }
                },
                selectedRowKeys: tranformtoSel(multichoice)
            }
        } :
            undefined
    }

    const extendedSearch: React.ReactNode = props.extendedsearch ? <Space style={{ float: "right" }} split={<Divider type="vertical" />}>
        <SearchButton {...props} {...extendedFilter} refreshFilter={refreshFilter} /></Space> :
        undefined

    const detcol: TColumn | undefined = findColDetails(props)

    return (
        <React.Fragment>
            {props.header ? <HeaderTable {...props.header} vars={props.vars} refreshaction={refreshtable} r={props} fbutton={buttonAction} selectedM={multichoice} /> : undefined}
            {extendedSearch}
            <Table
                {...rowSelection({ ...props })
                }
                title={() => title}
                rowKey={datasource.rowkey}
                dataSource={dsource}
                size="small"
                loading={datasource.status === Status.PENDING}
                columns={columns}
                {...paging}
                {...extend}
                summary={isSummary() ? () => (<SummaryTable {...props} list={datasource.res} />) : undefined}
                onRow={(r) => ({
                    onClick: () => {
                        if (props.onRowClick) props.onRowClick(r);
                    },
                })}
                {...props.props}
            />
            <ModalList {...modalProps} refreshaction={refreshtable} />
            <Drawer
                width={600}
                visible={showDetail}
                onClose={() => setShowDetail(false)}
                closable={false}
            >
                <OneRowTable r={currentRow as TRow} {...props} varsrestaction={(detcol?.showdetails as ShowDetails).varsrestaction} />
            </Drawer>
        </React.Fragment>
    );
};

export default RestTableView;