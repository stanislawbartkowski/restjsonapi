import React, { useState, useEffect } from "react";
import { Row, Col, Card } from 'antd'

import { RestTableParam, TRow } from "../../ts/typing"
import readlist, { DataSourceState } from "../ts/readlist";
import { ColumnList, Status } from "../ts/typing";
import ReadListError from "../errors/ReadListError";
import RecordCard from './RecordCard'
import { makeHeader } from "../ts/helper";

const CardList: React.FC<RestTableParam & ColumnList> = (props) => {

  const [datasource, setDataSource] = useState<DataSourceState>({
    status: Status.PENDING,
    res: [],
  });

  useEffect(() => readlist(props, (s: DataSourceState) => { setDataSource({ ...s }) })
    , [props.list, props.listdef]);

  if (datasource.status === Status.ERROR) return <ReadListError />
  if (datasource.status === Status.PENDING) return null;

  function getkey(r: TRow): Record<string, any> {
    return props.rowkey ? { key: r[props.rowkey] } : {}
  }

  return <Card title={makeHeader(props, undefined, { vars: props.vars, r: {} })}><Row gutter={[8, 8]}>
    {datasource.res.map(r => <Col {...getkey(r)}><RecordCard r={r} {...props} isCurrentDB={props.isCurrentDB} onRowClick={props.onRowClick} /> </Col>)}
  </Row>
  </Card>
}

export default CardList

