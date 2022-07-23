import React, { useState } from "react";
import { PageHeader, Space } from "antd";

import { trace } from "../ts/l";
import constructButton from "./ts/constructbutton";
import { emptyModalListProps, FAction, FieldValue, ModalFormProps, RestTableParam, TRow } from '../ts/typing'
import { TableToolBar, ButtonAction, ClickResult, ShowDetails, TAction, ClickAction } from "./ts/typing";
import { clickAction, istrue } from "./ts/helper";
import OneRowTable from './ShowDetails/OneRowTable'
import RestComponent from "./RestComponent";
import { commonVars, isObject, makeMessage } from "../ts/j";
import executeAction, { ispopupDialog } from './ts/executeaction'
import { IRefCall } from "./ModalForm/ModalFormView";
import { ErrorMessages, IIRefCall } from "./ModalForm/ModalFormDialog";
import defaults from "../ts/defaults";


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

const HeaderTable: React.FC<ShowDetails & { refreshaction: FAction, vars?: TRow, r: RestTableParam, fbutton: FAction, selectedM: FieldValue[] }> = (props) => {
  const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);

  const h: TableToolBar = props.toolbar as TableToolBar;

  const fmodalhook: FAction = () => {
    setIsModalVisible(emptyModalListProps);
  };

  function clickButton(b: ButtonAction) {
    ltrace(b.id)
    const rr: TRow = {}
    rr[defaults.multichoicevar] = props.selectedM
    const res: TAction = clickAction(b, { r: { ...commonVars(), ...rr }, vars: props.vars })
    const ii: IIRefCall = {
      setMode: function (loading: boolean, errors: ErrorMessages): void {
      },
      getVals: function (): TRow {
        return {}
      },
      setVals: function (r: TRow): void {
      },
      formGetVals: function (): TRow {
        return props.vars as TRow;
      }
    }
    if (isChooseButton(res, props.r)) props.fbutton(b, rr)
    // Data: 2022/07/23
    // pass vars from action to dialog invoked
    // vars: vars: {...props.vars}
    if (ispopupDialog(res)) setIsModalVisible({ vars: {...props.vars}, ...(res as ClickAction), visible: true, closeAction: fmodalhook })
    else executeAction({ ...(res as ClickAction), i: ii }, res, { ...rr, ...props.vars })
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
      <RestComponent {...modalProps} refreshaction={props.refreshaction} />
    </React.Fragment>
  );
};

export default HeaderTable;

