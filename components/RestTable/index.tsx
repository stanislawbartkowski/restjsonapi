/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";

import type { ColumnType } from "antd/lib/table";
import { Table } from "antd";
import { Drawer } from "antd";
import lstring from "../..//ts/localize";

import type { RestTableParam } from "../../ts/typing";
import type {
  TExtendable,
  ColumnList,
  TRow,
  FShowDetails,
  FActionResult,
  ClickResult,
  ModalListProps,
  RowData,
} from "./typing";
import { emptyModalListProps, Status } from "./typing";
import { restapilist } from "../../services/api";
import { transformColumns, makeMessage } from "./js/helper";
import InLine from "../../ts/inline";
import ModalList from "./ModalList";
import ModalForm from './ModalForm';
import DescriptionsDetails from "./RowDescription";
import getExtendableProps from "./Expendable";
import HeaderTable from "./HeaderTable";
import readdefs, { ReadDefsResult } from "./js/readdefs";

const emptyColumnList: ColumnList = { columns: [], rowkey: "" };

type DataSourceState = {
  status: Status;
  tabledata: RowData;
};


const RestTableError: React.FC = () => {
  return <div>Bład podczas czytania definicji z serwera</div>;
};

const RestTableCannotDisplay: React.FC<{ errmess: string }> = (props) => {
  return <div> {lstring(props.errmess)}</div>;
};


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

  const title: string | undefined = props.header
    ? makeMessage(props.header, {}, props.vars)
    : lstring("empty");

  useEffect(() => {
    restapilist(props.list, props.params).then((res) =>
      setDataSource({ status: Status.READY, tabledata: res.res })
    );
  }, [props.list, props.listdef, refreshnumber]);

  const extend: TExtendable | undefined = props.extendable
    ? getExtendableProps(props)
    : undefined;

  function refreshtable() {
    setRefreshNumber(refreshnumber+1)
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
        pagination={props.nopaging ? false : undefined}
        {...extend}
        onRow={(r) => ({
          onClick: () => {
            if (props.onRowClick) props.onRowClick(r);
          },
        })}
      />
      <ModalList {...modalProps}  refresh={refreshtable}  />
      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        closable={false}
      >
        <DescriptionsDetails r={currentRow} cols={columns} {...props} />
      </Drawer>
    </React.Fragment>
  );
};

type ListState = {
  list: string;
  status: Status;
  cols: ColumnList;
  js?: string;
};

const RestTableList: React.FC<RestTableParam> = (props) => {
  const [state, setState] = useState<ListState>({
    status: Status.PENDING,
    cols: emptyColumnList,
    list: props.list,
  });

  const dispmess: string | undefined = props.canDisplay
    ? props.canDisplay(props)
    : undefined;

  if (dispmess) return <RestTableCannotDisplay errmess={dispmess} />;

  if (state.status === Status.READY && state.list !== props.list) {
    setState({
      status: Status.PENDING,
      cols: emptyColumnList,
      list: props.list,
    });
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {

    function setS(d: ReadDefsResult) {

      if (d.status === Status.READY)
        setState({
          status: Status.READY,
          cols: { ...(d.res as ColumnList) },
          js: d.js,
          list: props.list,
        })
      else setState({
        status: Status.ERROR,
        cols: emptyColumnList,
        list: props.list,
      })

    }

    readdefs(props, setS)

  }, [props.list, props.listdef]);

  switch (state.status) {
    case Status.PENDING: {
      return null;
    }

    case Status.ERROR: {
      return <RestTableError />;
    }

    default:
      if (state.status === Status.READY) {
        return (
          <React.Fragment>
            <InLine js={state.js} />
            <RestTableView {...state.cols} {...props} />
          </React.Fragment>
        );
      } else return null;
  }
};

export default RestTableList;
