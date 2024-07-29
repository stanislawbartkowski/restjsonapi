import React, { ReactNode, useState } from "react";
import { Button, Dropdown, MenuProps, Space } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
//import { ItemType } from "antd/lib/menu/hooks/useItems";

import { trace } from "../ts/l";
import constructButton from "./ts/constructbutton";
import { emptyModalListProps, FAction, FButtonAction, FieldValue, FSetTitle, ModalFormProps, RAction, RestTableParam, TRow, VAction } from '../ts/typing'
import { TableToolBar, ButtonAction, ClickResult, ShowDetails, ClickAction, TAction, FRetAction, FRereadRest, MenuButtonAction } from "./ts/typing";
import { istrue } from "./ts/helper";
import OneRowTable from './ShowDetails/OneRowTable'
import RestComponent from "./RestComponent";
import { getButtonName, getButtonNameIcon, isObject, makeMessage } from "../ts/j";
import { createII, executeB, IIButtonAction, ispopupDialog } from './ts/executeaction'
import getIcon from "../ts/icons";

type HeaderProps = ShowDetails & { setvarsaction?: VAction, refreshaction: RAction, vars?: TRow, r: RestTableParam, fbutton: FAction, selectedM: FieldValue[], setTitle?: FSetTitle, rereadRest: FRereadRest, closeAction?: FAction, extendedTools?: React.ReactNode, switchDisplay?: ReactNode }

function ltrace(mess: string) {
  trace('HeaderTable', mess)
}

function isChooseButton(a: ClickResult, t: RestTableParam): boolean {
  return ((istrue(t.choosing) || istrue(t.multiselect)) && a.list === undefined && a.listdef === undefined && a.restaction === undefined)
}

function headerTitle(p: ShowDetails, vars?: TRow) {
  if (p.title === undefined) return undefined
  const title: string = makeMessage(p.title, { r: vars as TRow }) as string

  if (isObject(p.title) && p.title?.props) {
    return { title: <Space {...p.props}> {title} </Space> }
  }
  else return { title: title }
}

function constructMenuAction(key: number, b: ButtonAction, clickButton: FButtonAction) {

  const [label, iconid] = getButtonNameIcon(b)
  const icon = iconid !== undefined ? { "icon": getIcon(iconid) } : {}
  return { key: key.toString(), label: label, onClick: () => { clickButton(b) }, ...icon };
}

function createDropDown(p: MenuButtonAction, clickButton: FButtonAction): ReactNode {
  const menulist: ButtonAction[] = p.dropdown as ButtonAction[]
  let numb: number = 0
  const bname: string = getButtonName(p)
  const items: MenuProps['items'] = menulist.map((b) => constructMenuAction(numb++, b, clickButton))
  return <Dropdown menu={{ items }}>
    <Button {...p.props} icon={getIcon('menuoutlined')}>{bname}</Button>
  </Dropdown>
}

function isDropDown(p: MenuButtonAction): boolean {
  return p.dropdown !== undefined
}

function createMenu(props: HeaderProps, clickButton: FButtonAction): ReactNode {
  const h: TableToolBar = props.toolbar as TableToolBar;
  if (h === undefined) return undefined
  const hbuttons: MenuButtonAction[] = h
  return hbuttons.map((e: ButtonAction) => isDropDown(e) ? createDropDown(e, clickButton) : constructButton(e, clickButton))
}

const HeaderTable: React.FC<HeaderProps> = (props) => {
  const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);

  const fmodalhook: FAction = () => {
    setIsModalVisible(emptyModalListProps);
  };

  const retAction: FRetAction = (b: TAction, row: TRow) => {
    setIsModalVisible({ vars: row, ...(b as ClickAction), visible: true, closeAction: fmodalhook, rereadRest: props.rereadRest })
  }

  function clickButton(b: ButtonAction) {
    const ii: IIButtonAction = createII(b, props.vars as TRow, props.selectedM, retAction, undefined, props.setvarsaction)
    if (isChooseButton(ii.res, props.r)) props.fbutton(b, ii.rr)
    if (ispopupDialog(ii.res)) setIsModalVisible({ vars: { ...props.vars }, ...(ii.res as ClickAction), visible: true, closeAction: fmodalhook, rereadRest: props.rereadRest })
    else executeB(ii, props.rereadRest, undefined, props.setvarsaction, props.closeAction)
  }

  const title = (props.setTitle === undefined) ? headerTitle(props, props.vars) : undefined

  if (props.setTitle !== undefined) {
    const title: string | undefined = props.title !== undefined ? makeMessage(props.title, { r: props.vars as TRow }) as string : undefined
    props.setTitle(title)
  }

  const detaDescr = {
    r: props.vars as TRow,
    varsrestaction: props.varsrestaction,
    ...props.collist
  }

  const headerprops = props.collist ? { ...props.collist.props } : undefined

  const extra: ReactNode = <React.Fragment>{props.extendedTools} <Space style={{ float: "right", paddingBottom: "8px" }}>{createMenu(props, clickButton)} </Space></React.Fragment>

  return (
    <React.Fragment>
      <PageHeader {...title} 
        extra={props.switchDisplay}
        {...headerprops}>
        {extra}
        {props.collist ? <OneRowTable {...detaDescr} /> : undefined}
      </PageHeader>
      <RestComponent {...modalProps} refreshaction={props.refreshaction} setvarsaction={props.setvarsaction} />
    </React.Fragment>
  );
};

export default HeaderTable;

