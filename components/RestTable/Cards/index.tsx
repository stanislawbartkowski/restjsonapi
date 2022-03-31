import React, { useState, useEffect } from "react";
import { Row, Col, Card } from 'antd'

import { RestTableParam } from "../../../ts/typing"
import readlist, { DataSourceState } from "../js/readlist";
import { ColumnList, Status, TRow } from "../typing";
import ReadListError from "../errors/ReadListError";
import RecordCard from './RecordCard'
import { makeHeader } from "../js/helper";

const CardList: React.FC<RestTableParam & ColumnList> = (props) => {

  const [datasource, setDataSource] = useState<DataSourceState>({
    status: Status.PENDING,
    tabledata: [],
  });

  useEffect(() => readlist(props, (s: DataSourceState) => { setDataSource({ ...s }) })
    , [props.list, props.listdef]);

  if (datasource.status === Status.ERROR) return <ReadListError />
  if (datasource.status === Status.PENDING) return null;

  function getkey(r: TRow): Record<string, any> {
    return props.rowkey ? { key: r[props.rowkey] } : {}
  }

    return <Card title={makeHeader(props, undefined)}><Row gutter={[8, 8]}>
      {datasource.tabledata.map(r => <Col {...getkey(r)}><RecordCard r={r} {...props} cards={props} /> </Col>)}
    </Row>
    </Card>
}

export default CardList

