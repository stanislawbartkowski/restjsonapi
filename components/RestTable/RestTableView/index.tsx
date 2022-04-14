import React, { useState, useEffect } from "react";

import type { ColumnType } from "antd/lib/table";
import { Table } from "antd";
import { Drawer } from "antd";

import lstring from "../../../ts/localize";
import type { PropsType, RestTableParam, TRow } from "../../../ts/typing";
import type {
    TExtendable,
    ColumnList,
    FShowDetails,
    FActionResult,
    ClickResult,
    ModalListProps,
} from "../typing";
import { emptyModalListProps, Status } from "../typing";
import { transformColumns, makeHeader } from "../js/helper";
import ModalList from "../ModalList";
import DescriptionsDetails from "../RowDescription";
import getExtendableProps from "../Expendable";
import HeaderTable from "../HeaderTable";
import readlist, { DataSourceState } from '../js/readlist'
import ReadListError from '../errors/ReadListError'
import SummaryTable from '../SummaryTable'
import defaults from "../../../ts/defaults";
import { isNumber } from "../../../ts/j";

function propsPaging(props: RestTableParam & ColumnList, dsize: number): PropsType {
    let pageSize: number = props.pageSize ? props.pageSize : defaults.defpageSize
    let nopaging: boolean = false;
    if (props.nopaging) {
        if (isNumber(props.nopaging)) {
            const ps : number = props.nopaging as number
            if (dsize <= ps) nopaging = true
            else pageSize = ps
        }
        else nopaging = true;
    }

    return nopaging ? { pagination: false } : { pagination: { pageSize: pageSize } }
}


const RestTableView: React.FC<RestTableParam & ColumnList> = (props) => {
    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<TRow>();

    const [modalProps, setIsModalVisible] = useState<ModalListProps>(emptyModalListProps);
    const [datasource, setDataSource] = useState<DataSourceState>({
        status: Status.PENDING,
        tabledata: [],
    });

    const [refreshnumber, setRefreshNumber] = useState<number>(0);


    const f: FShowDetails = (entity: TRow) => {
        setCurrentRow(entity);
        setShowDetail(true);
    };

    const fmodalhook = (): void => {
        setIsModalVisible(emptyModalListProps);
    };

    const fresult: FActionResult = (entity: TRow, r: ClickResult) => {
        setIsModalVisible({
            visible: true,
            closeModal: fmodalhook,
            vars: entity,
            ...r,
        });
    };

    const columns: ColumnType<any>[] = transformColumns(props, {
        fdetails: f,
        fresult: fresult,
    });

    const title = makeHeader(props, lstring("empty"), props.vars)

    useEffect(() => readlist(props, (s: DataSourceState) => { setDataSource({ ...s }) })
        , [props.list, props.listdef, refreshnumber]);


    const extend: TExtendable | undefined = props.extendable
        ? getExtendableProps(props)
        : undefined;

    function refreshtable() {
        setRefreshNumber(refreshnumber + 1)
    }

    if (datasource.status === Status.ERROR) return <ReadListError />

    function isSummary(): boolean {
        return props.summary !== undefined
    }



    return (
        <React.Fragment>
            {props.toolbar ? <HeaderTable {...props} refresh={refreshtable} /> : undefined}
            <Table
                title={() => title}
                rowKey={props.rowkey}
                dataSource={datasource.tabledata}
                size="small"
                loading={datasource.status === Status.PENDING}
                columns={columns}
                //pagination={props.nopaging ? false : { pageSize: defaults.defpageSize }}
                {...propsPaging(props, datasource.tabledata.length)}
                {...extend}
                summary={isSummary() ? () => (<SummaryTable {...props} list={datasource.tabledata} />) : undefined}
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
                <DescriptionsDetails r={currentRow as TRow} cols={columns} {...props} />
            </Drawer>
        </React.Fragment>
    );
};

export default RestTableView;