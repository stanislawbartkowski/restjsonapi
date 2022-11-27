import React, { useState, useEffect } from "react";
import { Row, Col, Card } from 'antd'

import { emptyModalListProps, FAction, ModalFormProps, RestTableParam, TRow } from "../../ts/typing"
import readlist, { DataSourceState } from "../ts/readlist";
import { BUTTONACTION, ButtonAction, ClickAction, ColumnList, Status, TableToolBar } from "../ts/typing";
import ReadListError from "../errors/ReadListError";
import RecordCard, { AddCard, OnCardClick } from './RecordCard'
import { makeHeader } from "../ts/helper";
import RestComponent from "../RestComponent";
import { log } from "../../ts/l";
import { createII, executeB, IIButtonAction, ispopupDialog } from "../ts/executeaction";


const CardList: React.FC<RestTableParam & ColumnList & { refreshno?: number }> = (props) => {

  const [datasource, setDataSource] = useState<DataSourceState>({
    status: Status.PENDING,
    res: [],
  });

  const [refreshnumber, setRefreshNumber] = useState<number>(0);

  const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);

  const fmodalhook: FAction = () => {
    setIsModalVisible(emptyModalListProps);
  };


  useEffect(() => readlist(props, (s: DataSourceState) => { setDataSource({ ...s }) })
    , [props.list, props.listdef, props.refreshno, refreshnumber]);

  if (datasource.status === Status.ERROR) return <ReadListError />
  if (datasource.status === Status.PENDING) return null;

  function getkey(r: TRow): Record<string, any> {
    return props.rowkey ? { key: r[props.rowkey] } : {}
  }

  function getAdd(): ButtonAction | undefined {

    const buttons: TableToolBar | undefined = props.header?.toolbar
    if (buttons === undefined) return undefined
    const add: ButtonAction | undefined = buttons.find(b => b.id === BUTTONACTION.ADD)
    return add
  }

  const b: ButtonAction | undefined = getAdd()

  const bClick: OnCardClick = (b: ButtonAction) => {
    log(b.id)
    const ii: IIButtonAction = createII(b, props.vars as TRow)
    if (ispopupDialog(ii.res)) setIsModalVisible({ vars: { ...props.vars }, ...(ii.res as ClickAction), visible: true, closeAction: fmodalhook })
    else executeB(ii)
  }

  const refreshAction: FAction = () => {
    setRefreshNumber(refreshnumber + 1)
  }

  const addCard = b ? <AddCard {...props as ColumnList} {...b} cardClick={bClick} b={b} /> : undefined

  return <React.Fragment><Card title={makeHeader(props, undefined, { vars: props.vars, r: {} })}><Row gutter={[8, 8]}>
    {datasource.res.map(r => <Col {...getkey(r)}><RecordCard r={r} {...props} isSelected={props.isSelected} onRowClick={props.onRowClick} /> </Col>)}
    {addCard}
  </Row>
  </Card>
    <RestComponent {...modalProps} refreshaction={refreshAction} />
  </React.Fragment>

}

export default CardList

