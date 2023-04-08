import React, { useState, useEffect, MutableRefObject, useRef } from "react";


import type { ColumnType } from "antd/lib/table";
import { Table, Drawer, Space, Divider } from "antd";
import type { TableRowSelection } from "antd/lib/table/interface";

import lstring from "../../ts/localize";
import { ClickActionProps, emptyModalListProps, FieldValue, ModalFormProps, OneRowData, RestTableParam, RowData, TRow } from "../../ts/typing";
import type { TExtendable, } from "./typing";
import { ButtonAction, ClickAction, ColumnList, FActionResult, FShowDetails, NotificationKind, ShowDetails, TableHookParam, TAction, TColumn } from "../ts/typing";
import { Status } from "../ts/typing";
import { transformColumns, filterDataSource, filterDataSourceButton, CurrentPos, searchDataSource, eqRow } from "./js/helper";
import { findColDetails, makeHeader } from "../ts/helper";
import ModalList from "../RestComponent";
import getExtendableProps from "./Expendable";
import HeaderTable from "../HeaderTable";
import readlist, { DataSourceState } from '../ts/readlist'
import ReadListError from '../errors/ReadListError'
import SummaryTable from '../SummaryTable'
import { isNumber, isObject } from "../../ts/j";
import OneRowTable from "../ShowDetails/OneRowTable"
import SearchButton, { FSetFilter, FSetSearch } from "./SearchButton";
import { ExtendedFilter, noExtendedFilter } from "./SearchButton/SearchExtended";
import { createII, executeB, IIButtonAction } from "../ts/executeaction";
import ButtonStack from "./ButtonStack";
import propsPaging, { OnPageChange } from "../ts/tablepaging"
import openNotification from "../Notification";

export type TRefreshTable = {
    searchF: TRow
    next?: boolean
}


function tranformtoSel(sel: FieldValue[] | undefined): (string | number)[] {
    if (sel === undefined) return []
    return sel.map((e: FieldValue) => isNumber(e) ? e as number : e as string)
}

interface IRefCall {
    pageSize: number | undefined,
    search: ExtendedFilter | undefined
    searchF: TRefreshTable | undefined
    refreshsearch: number
}

const empty: IRefCall = {
    pageSize: undefined,
    search: undefined,
    searchF: undefined,
    refreshsearch: -1
}


const RestTableView: React.FC<RestTableParam & ColumnList & ClickActionProps & { refreshno?: number, refreshD?: TRefreshTable }> = (props) => {

    const [extendedFilter, setExtendedFilter] = useState<ExtendedFilter>(noExtendedFilter)

    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<TRow>();
    const [multichoice, setMultiChoice] = useState<FieldValue[]>(props.initsel as FieldValue[])
    const [page, setCurrentPage] = useState<number>(1)

    const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);
    const [datasource, setDataSource] = useState<DataSourceState>({
        status: Status.PENDING,
        res: [],
    });

    const [refreshnumber, setRefreshNumber] = useState<number>(0);

    const ref: MutableRefObject<IRefCall> = useRef<IRefCall>(empty) as MutableRefObject<IRefCall>


    const f: FShowDetails = (entity: TRow) => {
        setCurrentRow(entity);
        setShowDetail(true);
    };

    const fmodalhook = (): void => {
        setIsModalVisible({ visible: false });
    };

    const fresult: FActionResult = (entity: TRow, r: TAction) => {
        if (r.button) {
            const ii: IIButtonAction = createII(r.button, entity)
            executeB(ii, () => refreshtable())
            return
        }
        setIsModalVisible({
            visible: true,
            closeAction: fmodalhook,
            vars: entity,
            ...(r as ClickAction),
        });
    };

    const thook: TableHookParam = {
        fdetails: f,
        fresult: fresult,
    }

    const columns: ColumnType<any>[] = transformColumns(props, thook, props.vars);

    function toPars(): OneRowData {
        return { vars: props.vars, r: {}, t: datasource.res }
    }

    const title = makeHeader(props, lstring("empty"), toPars())

    useEffect(() => {
        readlist(props, (s: DataSourceState) => {
            setDataSource({ ...s });
            if ((refreshnumber === ref.current.refreshsearch) && ref.current.searchF !== undefined) {
                searchF(ref.current.searchF, genDSource(s.res))
                ref.current.searchF = undefined
            }
        })
    }, [props.list, props.listdef, refreshnumber, props.refreshno]);

    useEffect(() => {
        if (props.refreshD !== undefined) {
            const refreshD: TRefreshTable = props.refreshD as TRefreshTable
            searchF(refreshD, dsource)
        }
    }, [props.refreshD]);



    function searchF(refreshD: TRefreshTable, res: RowData) {
        const first: boolean = (refreshD.next === undefined || !refreshD.next)
        searchRowF({ isfilter: false, filtervalues: refreshD.searchF }, first, res)
    }

    const extend: TExtendable | undefined = props.extendable
        ? getExtendableProps(props, props.vars)
        : undefined;

    function refreshtable(r?: TAction) {
        setRefreshNumber(refreshnumber + 1)
        const vars: TRow | undefined = r?.vars
        if (vars !== undefined && vars.searchF !== undefined) {
            const refreshD: TRefreshTable = (vars.searchF as any) as TRefreshTable
            ref.current.searchF = refreshD
            ref.current.refreshsearch = refreshnumber + 1
        }
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

    function genDSource(res: RowData): RowData {
        const ddsource: RowData = props.filterJS ? filterDataSource(props, { r: {}, t: res, vars: props.vars }) : res

        const dsource: RowData = filterDataSourceButton(props, ddsource, extendedFilter)

        return dsource

    }

    function searchRowF(p: ExtendedFilter, first: boolean, dsource: RowData) {
        ref.current.search = p
        const foundPos: CurrentPos | undefined = searchDataSource(props, first ? undefined : currentRow, dsource, p, ref.current.pageSize)
        if (foundPos === undefined) {
            openNotification({ kind: NotificationKind.WARNING, title: { message: "notfoundtitle" }, description: { message: first ? "notfoundsearch" : "notfoundnext" } }, { r: currentRow as TRow })
            return
        }
        setCurrentPage(foundPos?.pageno as number)
        setCurrentRow(dsource[foundPos.pos])
    }


    const searchRow: FSetSearch = (p: ExtendedFilter, first: boolean) => {
        searchRowF(p, first, dsource)
    }

    const dsource: RowData = genDSource(datasource.res)


    if (props.onTableRead) props.onTableRead({ res: dsource, vars: datasource.vars });

    const onPageChange: OnPageChange = (page, pageSize) => {
        setCurrentPage(page)
        ref.current.pageSize = pageSize
    }

    const pagingD = propsPaging(props, dsource.length, onPageChange, page)
    ref.current.pageSize = pagingD[1]


    function buttonAction(b?: ButtonAction, r?: TRow) {
        if (b === undefined || props.closeAction === undefined) return;
        props.closeAction(b, { ...currentRow, ...r });
    }

    function findRowByKey(key: React.Key): TRow | undefined {
        const k = datasource.rowkey
        if (k === undefined) return undefined
        return datasource.res.find(r => r[k] === key)
    }

    const rowClassName = (record: TRow, index: number) => {
        if (currentRow === undefined) return ""
        return eqRow(props, record, currentRow) ? "selectedrow" : ""
    }


    function rowSelection(t: RestTableParam): { rowSelection: TableRowSelection<TRow> } | undefined {

        return (t.choosing || props.multiselect) ? {
            rowSelection: {
                type: t.choosing ? 'radio' : 'checkbox',
                onChange: (r: React.Key[]) => {
                    // if (props.multiSelect) props.multiSelect(r)
                    setMultiChoice(r)
                    if (props.setmulti) props.setmulti(r)
                    if (r.length > 0) {
                        const key: React.Key = r[0]
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
        <SearchButton {...props} {...extendedFilter} refreshFilter={refreshFilter} searchRow={searchRow} /></Space> :
        undefined

    const detcol: TColumn | undefined = findColDetails(props)
    const varrestaction = detcol && detcol.showdetails && isObject(detcol.showdetails) ? { varsrestaction: (detcol.showdetails as ShowDetails).varsrestaction } : {}

    const vars: TRow = { ...props.vars, ...datasource.vars }

    return (
        <React.Fragment>
            {props.header ? <HeaderTable {...props.header} vars={props.vars} setvarsaction={props.setvarsaction} refreshaction={refreshtable} r={props} fbutton={buttonAction} selectedM={multichoice} /> : undefined}
            {extendedSearch}
            <Table
                {...rowSelection({ ...props })}
                title={() => title}
                rowKey={datasource.rowkey}
                dataSource={dsource}
                size="small"
                loading={datasource.status === Status.PENDING}
                columns={columns}
                {...pagingD[0]}
                {...extend}
                rowClassName={rowClassName}
                summary={isSummary() ? () => (<SummaryTable isextendable={props.extendable !== undefined} {...props} list={datasource.res} vars={vars} />) : undefined}
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
                open={showDetail}
                onClose={() => setShowDetail(false)}
                closable={false}
            >
                <ButtonStack cols={props.columns} pars={{ r: currentRow as TRow }} r={thook} />
                <OneRowTable r={currentRow as TRow} {...props} {...varrestaction} />
            </Drawer>
        </React.Fragment>
    );
};

export default RestTableView;