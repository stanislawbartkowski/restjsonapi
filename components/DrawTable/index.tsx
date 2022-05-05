import React, { useState, useEffect } from "react";

import type { ColumnType } from "antd/lib/table";
import { Table, Drawer } from "antd";

import lstring from "../../ts/localize";
import type { OneRowData, PropsType, RestTableParam, RowData, TRow } from "../../ts/typing";
import type { TExtendable, } from "./typing";
import type { ClickResult, ColumnList, FActionResult, FShowDetails } from "../ts/typing";
import { Status } from "../ts/typing";
import { transformColumns, filterDataSource } from "./js/helper";
import { makeHeader } from "../ts/helper";
import ModalList from "../RestComponent";
import RowDescription from "../ShowDetails/RowDescription";
import getExtendableProps from "./Expendable";
import HeaderTable from "./HeaderTable";
import readlist, { DataSourceState } from '../ts/readlist'
import ReadListError from '../errors/ReadListError'
import SummaryTable from './SummaryTable'
import defaults from "../../ts/defaults";
import { isNumber } from "../../ts/j";
import OneRowTable from "../ShowDetails/OneRowTable"
import { ModalFormProps } from '../../components/ModalForm'
import {emptyModalListProps} from './typing'

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


const RestTableView: React.FC<RestTableParam & ColumnList> = (props) => {
    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<TRow>();

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
        , [props.list, props.listdef, refreshnumber]);


    const extend: TExtendable | undefined = props.extendable
        ? getExtendableProps(props, props.vars)
        : undefined;

    function refreshtable() {
        setRefreshNumber(refreshnumber + 1)
    }

    if (datasource.status === Status.ERROR) return <ReadListError />

    function isSummary(): boolean {
        return props.summary !== undefined
    }

    if (props.onerow) {
        return <OneRowTable {...props} r={datasource.res.length === 0 ? {} : datasource.res[0]} />
    }

    const dsource: RowData = props.filterJS ? filterDataSource(props, { r: {}, t: datasource.res, vars: props.vars }) : datasource.res

    if (props.onTableRead) props.onTableRead({ res: dsource, vars: datasource.vars });

    const paging = propsPaging(props, dsource.length)

    return (
        <React.Fragment>
            {props.header ? <HeaderTable {...props.header} vars={props.vars} refresh={refreshtable} /> : undefined}
            <Table
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
            <ModalList {...modalProps} refresh={refreshtable} />
            <Drawer
                width={600}
                visible={showDetail}
                onClose={() => setShowDetail(false)}
                closable={false}
            >
                <RowDescription r={currentRow as TRow} {...props} />
            </Drawer>
        </React.Fragment>
    );
};

export default RestTableView;