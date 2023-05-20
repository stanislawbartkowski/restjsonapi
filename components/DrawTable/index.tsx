import React, { useState, useEffect, MutableRefObject, useRef, ReactNode } from "react";


import type { ColumnType } from "antd/lib/table";
import { Table, Drawer, Space, Divider } from "antd";
import type { ExpandableConfig, TableRowSelection } from "antd/lib/table/interface";
import { SizeType } from "antd/es/config-provider/SizeContext";

import lstring from "../../ts/localize";
import { AppData, ClickActionProps, emptyModalListProps, FieldValue, FSetTitle, ModalFormProps, OneRowData, RestTableParam, RowData, TRow } from "../../ts/typing";
import type { ColumnsHook, ColumnsT, ColumnT, FSetSize, TExtendable, } from "./typing";
import { ButtonAction, ClickAction, ColumnList, FActionResult, FRereadRest, FRetAction, FShowDetails, NotificationKind, ShowDetails, TableHookParam, TAction, TColumn, TResizeColumn } from "../ts/typing";

import { Status } from "../ts/typing";
import { transformColumns, filterDataSource, filterDataSourceButton, CurrentPos, searchDataSource, eqRow, ColWidth, visibleColumnsR } from "./js/helper";
import { emptys, findColDetails, isfalse, makeHeader, makeHeaderString } from "../ts/helper";
import ModalList from "../RestComponent";
import getExtendableProps from "./Expendable";
import HeaderTable from "../HeaderTable";
import readlist, { DataSourceState } from '../ts/readlist'
import ReadListError from '../errors/ReadListError'
import SummaryTable from '../SummaryTable'
import { copyMap, isNumber, isObject } from "../../ts/j";
import OneRowTable from "../ShowDetails/OneRowTable"
import SearchButton, { FSetFilter, FSetSearch } from "./SearchButton";
import { ExtendedFilter, noExtendedFilter } from "./SearchButton/SearchExtended";
import { createII, executeB, IIButtonAction } from "../ts/executeaction";
import ButtonStack from "./ButtonStack";
import propsPaging, { OnPageChange } from "../ts/tablepaging"
import openNotification from "../Notification";
import { istrue } from '../ts/helper'
import defaults from "../../ts/defaults";
import SizeMenu from "./SizeMenu"
import { getAppData } from "../../ts/readresource";
import { createInitColsWidth, isResize, saveCookieColWidth } from "./js/cookiewidth"
import { getCookieTableSize, saveCookieTableSize } from "./js/cookietablesize"
import ArrangColumns from './ArrangeColumns'
import { fieldTitle } from "../ts/transcol";
import ResizableTitle from './ResizeTitle'
import { getCookieTableColumns, saveCookieTableColumns } from "./js/cookietablecolumns";
import DownloadButton from "./DownloadButton";

export type TRefreshTable = {
    searchF: TRow
    next?: boolean
    notwaitrefresh?: boolean
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

const isExtendedSearch = (p: ColumnList): boolean => {
    const a: AppData = getAppData()
    if (istrue(p.toolbar?.extendedsearch)) return true;
    if (isfalse(p.toolbar?.extendedsearch)) return false
    return istrue(a.toolbar?.extendedsearch)
}

const isTableSize = (p: ColumnList): boolean => {
    const a: AppData = getAppData()
    if (istrue(p.toolbar?.tablesize)) return true;
    if (isfalse(p.toolbar?.tablesize)) return false;
    return istrue(a.toolbar?.tablesize)
}

const isRearrangeCols = (p: ColumnList): boolean => {
    const a: AppData = getAppData()
    if (istrue(p.toolbar?.arrangecol)) return true;
    if (isfalse(p.toolbar?.arrangecol)) return false;
    return istrue(a.toolbar?.arrangecol)
}

const isExcelButton = (p: ColumnList): boolean => {
    const a: AppData = getAppData()
    if (istrue(p.toolbar?.excelfile)) return true;
    if (isfalse(p.toolbar?.excelfile)) return false;
    return istrue(a.toolbar?.excelfile)
}

function transformSortColumns(vcols: ColumnType<any>[], p: ColumnList, arrange_cols?: ColumnsT, vars?: TRow): ColumnsT {
    if (arrange_cols !== undefined) return arrange_cols
    const v: Set<string> = new Set<string>(vcols.map(c => c.dataIndex as string))
    const ta: ColumnsT = p.columns.map(c => {
        const title: string = fieldTitle(c, { r: {}, vars: vars })
        const cl: ColumnT = {
            key: c.field,
            title: title,
            included: v.has(c.field)
        }
        return cl
    })
    return ta
}


const RestTableView: React.FC<RestTableParam & ColumnList & ClickActionProps & { refreshno?: number, refreshD?: TRefreshTable, setTitle?: FSetTitle, expanded?: boolean, rereadRest?: FRereadRest }> = (props) => {

    const [extendedFilter, setExtendedFilter] = useState<ExtendedFilter>(noExtendedFilter)

    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<TRow>();
    const [multichoice, setMultiChoice] = useState<FieldValue[]>(props.initsel as FieldValue[])
    const [page, setCurrentPage] = useState<number>(1)
    const [colw, setColW] = useState<ColWidth>(createInitColsWidth(props, props))
    const [arrange_columns, setArrangeColumns] = useState<ColumnsT | undefined>(getCookieTableColumns(props, props))

    const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);
    const [datasource, setDataSource] = useState<DataSourceState>({
        status: Status.PENDING,
        res: [],
    });
    const [tableSize, setTableSize] = useState<SizeType>(getCookieTableSize(props))

    const [refreshnumber, setRefreshNumber] = useState<number>(0);

    const ref: MutableRefObject<IRefCall> = useRef<IRefCall>(empty) as MutableRefObject<IRefCall>

    // resize
    const components = isResize(props.toolbar?.resize) ? {
        header: {
            cell: ResizableTitle,
        },
    } : undefined

    const f: FShowDetails = (entity: TRow) => {
        setCurrentRow(entity);
        setShowDetail(true);
    };


    const fmodalhook = (): void => {
        setIsModalVisible({ visible: false, rereadRest: () => { } });
    };

    const retAction: FRetAction = (b: TAction, row: TRow) => {
        setIsModalVisible({
            visible: true,
            closeAction: fmodalhook,
            rereadRest: props.rereadRest,
            vars: row,
            ...(b as ClickAction),
        });

    }

    const fresult: FActionResult = (entity: TRow, r: TAction) => {
        if (r.button) {
            const ii: IIButtonAction = createII(r.button, entity, undefined, retAction, props.rereadRest)
            executeB(ii, undefined, () => refreshtable())
            return
        }
        setIsModalVisible({
            visible: true,
            rereadRest: props.rereadRest,
            closeAction: fmodalhook,
            vars: entity,
            ...(r as ClickAction),
        });
    };

    const thook: TableHookParam = {
        fdetails: f,
        fresult: fresult,
    }

    function toPars(): OneRowData {
        return { vars: props.vars, r: {}, t: datasource.res }
    }

    const title: ReactNode | undefined = (props.setTitle !== undefined) ? undefined : makeHeader(props, lstring("empty"), toPars())

    let istitle: boolean = false

    if (props.setTitle !== undefined) {
        const headers: string | undefined = makeHeaderString(props, lstring("empty"), toPars())
        props.setTitle(headers)
        if (!emptys(headers)) istitle = true
    }

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
            if (istrue(refreshD.notwaitrefresh)) searchF(refreshD, dsource)
            else {
                ref.current.searchF = { ...props.refreshD }
                ref.current.refreshsearch = refreshnumber
            }
        }
    }, [props.refreshD]);



    function searchF(refreshD: TRefreshTable, res: RowData) {
        const first: boolean = (refreshD.next === undefined || !refreshD.next)
        searchRowF({ isfilter: false, filtervalues: refreshD.searchF }, first, res)
    }

    const extend: ExpandableConfig<TRow> | undefined = props.extendable
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
                columnWidth: defaults.checkSize,
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

    const resizeF: TResizeColumn = (c: TColumn, newwidth: number) => {
        const m: ColWidth = copyMap(colw)
        m.set(c.field, newwidth)
        setColW(m)
        saveCookieColWidth(props, m)
    }


    const columns: ColumnType<any>[] = transformColumns(props, thook, props.vars, colw, resizeF, arrange_columns);

    const changeMenuSize: FSetSize = (size: SizeType) => {
        setTableSize(size)
        saveCookieTableSize(props, size)
    }
    const extendedSearch: React.ReactNode = isExtendedSearch(props) ? <SearchButton {...props} {...extendedFilter} refreshFilter={refreshFilter} searchRow={searchRow} /> :
        undefined
    const resizeTable: ReactNode = isTableSize(props) ? <SizeMenu onSize={changeMenuSize} /> : undefined

    const downloadbutton: ReactNode = isExcelButton(props) ? <DownloadButton cols={props} r_cols={arrange_columns} rows={dsource} vars={props.vars} header={makeHeaderString(props, undefined, toPars())} /> : undefined

    const colo: ColumnsT = transformSortColumns(columns, props, arrange_columns, props.vars)

    const colsHook: ColumnsHook = (cols: ColumnsT) => {
        setArrangeColumns(cols)
        saveCookieTableColumns(props, cols)
    }

    const arrangeColumns: ReactNode = isRearrangeCols(props) ? <ArrangColumns cols={colo} colshook={colsHook} /> : undefined

    const extendedTools: React.ReactNode = istrue(props.toolbar?.notool) || istrue(props.expanded) || (extendedSearch === undefined && resizeTable === undefined && arrangeColumns === undefined && downloadbutton === undefined) ? undefined :
        <Space style={{ float: "right" }} split={<Divider type="vertical" />} align="center">
            {downloadbutton}{arrangeColumns}{resizeTable}{extendedSearch}
        </Space>


    const detcol: TColumn | undefined = findColDetails(props)
    const varrestaction = detcol && detcol.showdetails && isObject(detcol.showdetails) ? { varsrestaction: (detcol.showdetails as ShowDetails).varsrestaction } : {}

    const vars: TRow = { ...props.vars, ...datasource.vars }

    return (
        <React.Fragment>
            {props.header ? <HeaderTable {...props.header} vars={props.vars} setvarsaction={props.setvarsaction} refreshaction={refreshtable} r={props} fbutton={buttonAction}
                selectedM={multichoice} setTitle={(title) => { if (!istitle && props.setTitle !== undefined) props.setTitle(title) }} rereadRest={props.rereadRest as FRereadRest} /> : undefined}
            {extendedTools}
            <Table
                {...rowSelection({ ...props })}
                components={components}
                title={() => title}
                rowKey={datasource.rowkey}
                dataSource={dsource}
                size={tableSize}
                loading={datasource.status === Status.PENDING}
                columns={columns}
                {...pagingD[0]}
                expandable={extend}
                rowClassName={rowClassName}
                summary={isSummary() ? () => (<SummaryTable isextendable={props.extendable !== undefined} {...props} list={datasource.res} vars={vars} columns={visibleColumnsR(props, arrange_columns)} />) : undefined}
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