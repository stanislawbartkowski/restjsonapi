import React, { useState, useEffect } from "react";
import { Row, Col, Card } from 'antd'

import { emptyModalListProps, FAction, FIELDTYPE, ModalFormProps, RAction, RestTableParam, RowData, TRow } from "../../ts/typing"
import readlist, { DataSourceState } from "../ts/readlist";
import { BUTTONACTION, ButtonAction, ClickAction, ColumnList, Status, TableHookParam, FActionResult, TableToolBar, TAction, TActions, TColumn } from "../ts/typing";
import ReadListError from "../errors/ReadListError";
import RecordCard, { AddCard } from './RecordCard'
import { makeHeader } from "../ts/helper";
import RestComponent from "../RestComponent";
import { log } from "../../ts/l";
import { createII, executeB, IIButtonAction, ispopupDialog } from "../ts/executeaction";
import { sortboolinc, sortinc, sortnumberinc } from "../../ts/sortproc";
import { fieldType } from "../ts/transcol";
import { isnotdefined } from "../../ts/j";


const CardList: React.FC<RestTableParam & ColumnList & { refreshno?: number, switchDisplay?: React.ReactNode }> = (props) => {

  const [datasource, setDataSource] = useState<DataSourceState>({
    status: Status.PENDING,
    res: [],
  });

  const [refreshnumber, setRefreshNumber] = useState<number>(0);

  const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);

  const fmodalhook: FAction = () => {
    setIsModalVisible(emptyModalListProps);
  };

  const znajdzA = (): TActions | undefined => {
    const c: TColumn | undefined = props.columns.find(c => c.actions)
    if (c === undefined) return undefined
    return c.actions
  }

  const a: TActions | undefined = znajdzA()

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
    const buttonsb : ButtonAction[] = buttons as ButtonAction[]
    const add: ButtonAction | undefined = buttonsb.find(b => b.id === BUTTONACTION.ADD)
    return add
  }

  const b: ButtonAction | undefined = getAdd()

  const bClick: FActionResult = (r: TRow, b: TAction) => {
    const ii: IIButtonAction = createII(b, r)
    if (ispopupDialog(ii.res)) setIsModalVisible({ vars: { ...r }, ...(ii.res as ClickAction), visible: true, closeAction: fmodalhook })
    else executeB(ii)
  }

  const refreshAction: RAction = () => {
    setRefreshNumber(refreshnumber + 1)
  }

  const addCard = b ? <AddCard {...props as ColumnList} {...b} cardClick={bClick} b={b} /> : undefined

  const thook: TableHookParam = {
    fdetails: (r: TRow) => {
      log("fdetails")
    },
    fresult: bClick
  }

  const elems: RowData = datasource.res


  function compareFN(e1: TRow, e2: TRow): number {

    const sorts: string[] = props.sortcol as string[]

    for (var f of sorts) {
      const c: TColumn | undefined = (props.columns as TColumn[]).find(e => e.field === f)
      if (c === undefined) continue
      const fieldtype: FIELDTYPE = fieldType(c)
      if (isnotdefined(e1[f]) && isnotdefined(e2[f])) continue
      const res: number = (fieldtype === FIELDTYPE.NUMBER) ? sortnumberinc(e1, e2, f) : (fieldtype === FIELDTYPE.BOOLEAN) ? sortboolinc(e1, e2, f) : sortinc(e1, e2, f)
      if (res !== 0) return res
    }

    return 0
  }

  if (props.sortcol !== undefined) {
    elems.sort(compareFN)
  }

  return <React.Fragment><Card title={makeHeader(props, undefined, { vars: props.vars, r: {} })} extra={props.switchDisplay}>
    <Row gutter={[8, 8]}>
      {elems.map(r => <Col {...getkey(r)}><RecordCard r={r} {...props} isSelected={props.isSelected} onRowClick={props.onRowClick} a={a} h={thook} /> </Col>)}
      {addCard}
    </Row>
  </Card>
    <RestComponent {...modalProps} refreshaction={refreshAction} />
  </React.Fragment>

}

export default CardList

