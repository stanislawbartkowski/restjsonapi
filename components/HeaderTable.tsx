import React, { useState } from "react";
import { PageHeader, Space } from "antd";

import { trace } from "../ts/l";
import constructButton from "./ts/constructbutton";
import { emptyModalListProps, FAction, FieldValue, ModalFormProps, RestTableParam, TRow, VAction } from '../ts/typing'
import { TableToolBar, ButtonAction, ClickResult, ShowDetails, ClickAction } from "./ts/typing";
import { istrue } from "./ts/helper";
import OneRowTable from './ShowDetails/OneRowTable'
import RestComponent from "./RestComponent";
import { isObject, makeMessage } from "../ts/j";
import { createII, executeB, IIButtonAction, ispopupDialog } from './ts/executeaction'


function ltrace(mess: string) {
  trace('HeaderTable', mess)
}

function isChooseButton(a: ClickResult, t: RestTableParam): boolean {
  return ((istrue(t.choosing) || istrue(t.multiselect)) && a.list === undefined && a.listdef === undefined)
}

function headerTitle(p: ShowDetails, vars?: TRow) {
  if (p.title === undefined) return undefined
  const title: string = makeMessage(p.title, { r: vars as TRow }) as string

  if (isObject(p.title) && p.title?.props) {
    return { title: <Space {...p.props}> {title} </Space> }
  }
  else return { title: title }
}

const HeaderTable: React.FC<ShowDetails & { setvarsaction?: VAction, refreshaction: FAction, vars?: TRow, r: RestTableParam, fbutton: FAction, selectedM: FieldValue[] }> = (props) => {
  const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);

  const h: TableToolBar = props.toolbar as TableToolBar;

  const fmodalhook: FAction = () => {
    setIsModalVisible(emptyModalListProps);
  };

  function clickButton(b: ButtonAction) {
    ltrace(b.id)
    const ii: IIButtonAction = createII(b, props.vars as TRow, props.selectedM)
    if (isChooseButton(ii.res, props.r)) props.fbutton(b, ii.rr)
    if (ispopupDialog(ii.res)) setIsModalVisible({ vars: { ...props.vars }, ...(ii.res as ClickAction), visible: true, closeAction: fmodalhook })
    else executeB(ii, undefined, props.setvarsaction)
  }

  const title = headerTitle(props, props.vars);

  const detaDescr = {
    r: props.vars as TRow,
    ...props.collist
  }

  const headerprops = props.collist ? { ...props.collist.props } : undefined

  return (
    <React.Fragment>
      <PageHeader {...title}
        {...headerprops}
        extra={h ? h.map((e: ButtonAction) => constructButton(e, clickButton)) : undefined} >
        {props.collist ? <OneRowTable {...detaDescr} /> : undefined}
      </PageHeader>
      <RestComponent {...modalProps} refreshaction={props.refreshaction} setvarsaction={props.setvarsaction} />
    </React.Fragment>
  );
};

export default HeaderTable;

