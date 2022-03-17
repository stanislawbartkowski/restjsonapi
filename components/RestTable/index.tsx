/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef } from 'react';

import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { Drawer } from 'antd';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import lstring from '../..//ts/localize'
import { isObject, log } from '../../ts/j'


import type { RestTableParam } from '../../ts/typing';
import type { ColumnList, Column, SortFilter, Row, PageParams, JsonTableResult, ShowDetails, FShowDetails, FActionResult, ClickResult } from './types';
import { Status, emptyColumnList } from './types';
import { restapilist, restapilistdef, restapijs } from '../../services/api';
import { transformColumns, analyzeSortFilter, dataSortFilter, makeMessage } from './helper'
import InLine from '../../ts/inline'


const RestTableError: React.FC = () => {
  return <div>Bład podczas czytania definicji z serwera</div>
}

const RestTableCannotDisplay: React.FC<{ errmess: string }> = (props) => {
  return <div> {lstring(props.errmess)}</div>
}

function findColDetails(c: ColumnList): Column | undefined {
  return c.columns.find(x => x.showdetails);
}


function findKeyDetails(c: ColumnList): string | undefined {
  const C: Column | undefined = findColDetails(c)
  return C == undefined ? undefined : C.field
}

function detailsTitle(c: ColumnList, row: Row): string | undefined {

  const C: Column | undefined = findColDetails(c)
  if (C == undefined) return undefined;
  if (!isObject(C.showdetails)) return undefined
  const s: ShowDetails = C.showdetails as ShowDetails
  if (s.jstitle == undefined) return undefined;
  return makeMessage(s.jstitle, row)
}

const RestTableView: React.FC<RestTableParam & ColumnList> = (props) => {

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<Row>();

  const f: FShowDetails = (entity: Row) => {
    setCurrentRow(entity);
    setShowDetail(true);
  }

  const fresult: FActionResult = (entity: Row, r: ClickResult) => {
    log(r.result)
  }

  //  const intl = useIntl();
  const columns: ProColumns[] = transformColumns(props, { fdetails: f, fresult: fresult });
  const actionRef = useRef<ActionType>();

  //  const title: string | undefined = props.header != undefined ? props.header : 'empty'
  const title: string | undefined = props.header ? makeMessage(props.header) : lstring('empty')

  async function getlist(
    params: PageParams,
    options?: { [key: string]: any }) {

    const sf: SortFilter | undefined = analyzeSortFilter(props, params, options);

    if (sf == undefined) return restapilist(props.list)
    return restapilist(props.list).then(
      res => dataSortFilter(props, res as JsonTableResult, sf)
    ).catch(err => { throw (err) })

  }


  return (
    <PageContainer>
      <ProTable<PageParams>
        headerTitle={title}
        actionRef={actionRef}
        rowKey={props.key}
        search={{
          labelWidth: 120,
        }}
        request={getlist}
        columns={columns}
        onRow={(r) => ({
          onClick: () => { if (props.onRowClick != undefined) props.onRowClick(r); }
        })}
      />

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        <ProDescriptions<Row>
          column={2}
          title={detailsTitle(props, currentRow || {})}
          request={async () => ({
            data: currentRow || {},
          })}
          params={{
            id: (currentRow || {})[findKeyDetails(props) as string]
          }}
          columns={columns as ProDescriptionsItemProps[]}
        />

      </Drawer>

    </PageContainer>


  );
}

const RestTableList: React.FC<RestTableParam> = (props) => {

  const dispmess: string | undefined = props.canDisplay == undefined ? undefined : props.canDisplay(props);

  if (dispmess != undefined) return <RestTableCannotDisplay errmess={dispmess} />;

  const [state, setState] = useState({ status: Status.PENDING, cols: emptyColumnList })
  const [statejs, setStateJs] = useState({ status: Status.PENDING, js: undefined })

  if (state.status == Status.PENDING) {

    restapilistdef(props.listdef).then((response: any) => {
      setState({ status: Status.READY, cols: { ...response } })
    }).catch(() => {
      setState({ status: Status.ERROR, cols: emptyColumnList })
    })
  }

  if (state.status == Status.READY) {
    switch (statejs.status) {
      case Status.PENDING:
        if (state.cols.js == undefined) {
          setStateJs({ status: Status.READY, js: undefined })
        }
        else
          restapijs(state.cols.js).then((response: any) => {
            setStateJs({ status: Status.READY, js: response })
          }).catch(() => {
            setState({ status: Status.ERROR, cols: emptyColumnList })
          })
        break;
      case Status.ERROR:
        setState({ status: Status.ERROR, cols: emptyColumnList });
        break;
      default: break;
    }
  }

  switch (state.status) {
    case Status.PENDING: { return null; }

    case Status.ERROR: { return <RestTableError /> }

    default:
      if (statejs.status == Status.READY) {
        return <React.Fragment>
          <InLine js={statejs.js} />
          <RestTableView {...state.cols} {...props} />
        </React.Fragment>
      }
      else return null;
  }
}

export default RestTableList

