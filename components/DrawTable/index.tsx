import React, { useState, useEffect, MutableRefObject, useRef, ReactNode } from "react";

import { Resizable } from 'react-resizable';

import type { ColumnType } from "antd/lib/table";
import { Table, Drawer, Space, Divider } from "antd";
import type { ExpandableConfig, TableRowSelection } from "antd/lib/table/interface";

import lstring from "../../ts/localize";
import { ClickActionProps, emptyModalListProps, FIELDTYPE, FieldValue, FSetTitle, ModalFormProps, OneRowData, RestTableParam, RowData, TRow } from "../../ts/typing";
import { ButtonAction, ClickAction, ColumnList, FActionResult, FShowDetails, NotificationKind, ShowDetails, TableHookParam, TAction, TColumn, TColumns, TResize, TResizeColumn } from "../ts/typing";
import { Status } from "../ts/typing";
import { transformColumns, filterDataSource, filterDataSourceButton, CurrentPos, searchDataSource, eqRow, ColWidth } from "./js/helper";
import { emptys, findColDetails, makeHeader, makeHeaderString, visibleColumns } from "../ts/helper";
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
import { fieldType } from "../ts/transcol";
import defaults from "../../ts/defaults";
import { getCookie, setCookie } from "../../ts/cookies";


// resize
const ResizableTitle = (props: any) => {
    const { onResize, width, ...restProps } = props;

    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <Resizable
            width={width}
            height={0}
            handle={
                <span
                    className="react-resizable-handle"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                />
            }
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
        >
            <th {...restProps} />
        </Resizable>
    );
};

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

function defaultW(c: TColumn, resize?: TResize): number | string | undefined {
    if (resize === undefined || !resize.resize) return c.width
    if (c.width !== undefined) return c.width
    const fieldtype: FIELDTYPE = fieldType(c)
    var w: number = defaults.sizedefault;
    switch (fieldtype) {
        case FIELDTYPE.NUMBER:
            w = resize.defaultnumber ? resize.defaultnumber : defaults.sizenumber
            break;
        case FIELDTYPE.MONEY:
            w = resize.defaultmoney ? resize.defaultmoney : defaults.sizemoney
            break;
        case FIELDTYPE.BOOLEAN:
            w = resize.defaultboolean ? resize.defaultboolean : defaults.sizeboolean
            break;
        case FIELDTYPE.DATE:
            w = resize.defaultdate ? resize.defaultdate : defaults.sizedate
            break;
    }
    return w
}


function isResize(p: ColumnList): boolean {
    if (p.resize === undefined) return false;
    return p.resize.resize
}

function cookieName(p: RestTableParam): string {
    const n: string = (p.list as string) + "_" + (p.listdef !== undefined ? p.listdef : "list")
    return n + "_columns_width"
}

function saveCookieColWidth(p: RestTableParam, w: ColWidth) {
    const cookiename: string = cookieName(p)
    const j: string = JSON.stringify(Array.from(w.entries()));
    setCookie(cookiename, j)
}

function getCookieColWidth(p: RestTableParam): ColWidth | undefined {
    const cookiename: string = cookieName(p)
    const j: string | undefined = getCookie(cookiename)
    if (j === undefined) return undefined
    const m = new Map(JSON.parse(j));
    return m as ColWidth
}

function createInitColsWidth(r: RestTableParam, p: ColumnList): ColWidth {
    const clist: TColumns = visibleColumns(p.columns);
    const m: ColWidth = new Map<string, number>()
    const cm: ColWidth | undefined = getCookieColWidth(r)
    clist.forEach(c => {
        const w = cm?.get(c.field) ? cm.get(c.field) : defaultW(c, p.resize)
        if (w !== undefined) m.set(c.field, w)
    }
    )
    return m
}


const RestTableView: React.FC<RestTableParam & ColumnList & ClickActionProps & { refreshno?: number, refreshD?: TRefreshTable, setTitle?: FSetTitle }> = (props) => {

    const [extendedFilter, setExtendedFilter] = useState<ExtendedFilter>(noExtendedFilter)

    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<TRow>();
    const [multichoice, setMultiChoice] = useState<FieldValue[]>(props.initsel as FieldValue[])
    const [page, setCurrentPage] = useState<number>(1)
    const [colw, setColW] = useState<ColWidth>(createInitColsWidth(props, props))

    const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);
    const [datasource, setDataSource] = useState<DataSourceState>({
        status: Status.PENDING,
        res: [],
    });

    const [refreshnumber, setRefreshNumber] = useState<number>(0);

    const ref: MutableRefObject<IRefCall> = useRef<IRefCall>(empty) as MutableRefObject<IRefCall>

    // resize
    const components = isResize(props) ? {
        header: {
            cell: ResizableTitle,
        },
    } : undefined

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

    const extendedSearch: React.ReactNode = props.extendedsearch ? <Space style={{ float: "right" }} split={<Divider type="vertical" />}>
        <SearchButton {...props} {...extendedFilter} refreshFilter={refreshFilter} searchRow={searchRow} /></Space> :
        undefined

    const detcol: TColumn | undefined = findColDetails(props)
    const varrestaction = detcol && detcol.showdetails && isObject(detcol.showdetails) ? { varsrestaction: (detcol.showdetails as ShowDetails).varsrestaction } : {}

    const vars: TRow = { ...props.vars, ...datasource.vars }

    const resizeF: TResizeColumn = (c: TColumn, newwidth: number) => {
        const m: ColWidth = copyMap(colw)
        m.set(c.field, newwidth)
        setColW(m)
        saveCookieColWidth(props, m)
    }

    const columns: ColumnType<any>[] = transformColumns(props, thook, props.vars, colw, resizeF);

    return (
        <React.Fragment>
            {props.header ? <HeaderTable {...props.header} vars={props.vars} setvarsaction={props.setvarsaction} refreshaction={refreshtable} r={props} fbutton={buttonAction}
                selectedM={multichoice} setTitle={(title) => { if (!istitle && props.setTitle !== undefined) props.setTitle(title) }} /> : undefined}
            {extendedSearch}
            <Table
                {...rowSelection({ ...props })}
                components={components}
                title={() => title}
                rowKey={datasource.rowkey}
                dataSource={dsource}
                size="small"
                loading={datasource.status === Status.PENDING}
                columns={columns}
                {...pagingD[0]}
                expandable={extend}
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