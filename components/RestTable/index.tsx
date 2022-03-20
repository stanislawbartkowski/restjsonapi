/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';

import type { ColumnType } from 'antd/lib/table';
import { Table } from 'antd'
import { Drawer } from 'antd';
import lstring from '../..//ts/localize'
import { log } from '../../ts/j'


import type { RestTableParam } from '../../ts/typing';
import type { TExtendable, ListState, ColumnList, Row, FShowDetails, FActionResult, ClickResult, ModalListProps, RowData } from './types';
import { emptyModalListProps, Status, emptyColumnList } from './types';
import { restapilist, restapilistdef, restapijs } from '../../services/api';
import { transformColumns, makeMessage } from './helper'
import InLine from '../../ts/inline'
import ModalList from './ModalList'
import DescriptionsDetails from './RowDescription'
import getExtendableProps from './Expendable'


const RestTableError: React.FC = () => {
  return <div>Bład podczas czytania definicji z serwera</div>
}

const RestTableCannotDisplay: React.FC<{ errmess: string }> = (props) => {
  return <div> {lstring(props.errmess)}</div>
}

type DataSourceState = {
  status: Status;
  tabledata: RowData;
}

const RestTableView: React.FC<RestTableParam & ColumnList> = (props) => {

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<Row>();

  const [modalProps, setIsModalVisible] = useState<ModalListProps>(emptyModalListProps);
  const [datasource, setDataSource] = useState<DataSourceState>({ status: Status.PENDING, tabledata: [] })

  const f: FShowDetails = (entity: Row) => {
    setCurrentRow(entity);
    setShowDetail(true);
  }

  const fmodalhook = () => {
    setIsModalVisible(emptyModalListProps);
  }

  const fresult: FActionResult = (entity: Row, r: ClickResult) => {
    setIsModalVisible({
      visible: true,
      closehook: fmodalhook,
      vars: entity,
      ...r
    }
    )
  }

  const columns: ColumnType<any>[] = transformColumns(props, { fdetails: f, fresult: fresult });

  const title: string | undefined = props.header ? makeMessage(props.header, {}, props.vars) : lstring('empty')

  useEffect(() => {
    restapilist(props.list, props.params).then(
      res => setDataSource({ status: Status.READY, tabledata: res.data })
    )
  }, []);

  const extend: TExtendable | undefined = props.extendable ? getExtendableProps(props) : undefined

  return (
    <React.Fragment>
      <Table
        title={() => title}
        rowKey={props.rowkey}
        dataSource={datasource.tabledata}
        size='small'
        loading={datasource.status == Status.PENDING}
        columns={columns}
        pagination={props.nopaging ? false : undefined}
        {...extend}
        onRow={(r) => ({
          onClick: () => { if (props.onRowClick) props.onRowClick(r); }
        })}
      />
      <ModalList {...modalProps} />
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
}

const RestTableList: React.FC<RestTableParam> = (props) => {

  const [state, setState] = useState<ListState>({ status: Status.PENDING, cols: emptyColumnList })

  const dispmess: string | undefined = props.canDisplay ? props.canDisplay(props) : undefined;

  if (dispmess) return <RestTableCannotDisplay errmess={dispmess} />;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(
    () => {


      let lisstjsready: boolean = false;
      let js: string | undefined = undefined
      let idef: ColumnList | undefined = undefined

      log("RestTableList " + props.list);

      function setstatus() {
        if (lisstjsready && idef != undefined) setState({ status: Status.READY, cols: idef, js: js });
      }

      restapilistdef(props.listdef ? props.listdef : props.list).then((response: any) => {
        idef = response;
        if ((idef as ColumnList).js) {
          restapijs((idef as ColumnList).js as string).then((jsresponse: any) => {
            js = jsresponse;
            lisstjsready = true;
            setstatus();
          }).catch(() => {
            setState({ status: Status.ERROR, cols: emptyColumnList })
          })
        } else {
          lisstjsready = true;
          setstatus();
        }
      }).catch(() => {
        setState({ status: Status.ERROR, cols: emptyColumnList })
      })
    }, []);


  switch (state.status) {
    case Status.PENDING: { return null; }

    case Status.ERROR: { return <RestTableError /> }

    default:
      if (state.status == Status.READY) {
        return <React.Fragment>
          <InLine js={state.js} />
          <RestTableView {...state.cols} {...props} />
        </React.Fragment>
      }
      else return null;
  }
}

export default RestTableList

