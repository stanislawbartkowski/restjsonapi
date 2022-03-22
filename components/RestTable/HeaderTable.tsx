import React, { useState } from "react";
import { Button, PageHeader } from "antd";

import type { TableToolBar, ColumnList, ModalListProps, ClickResult, TableToolBarElem } from './typing'
import { TOOLADD, emptyModalListProps } from "./typing";
import lstring from "../../ts/localize";
import getIcon from "../../ts/icons";
import ModalForm from "./ModalForm";
import { log } from "../../ts/j";
import { clickAction, ismaskClicked } from './helper'

type FClickButton = (b: TableToolBarElem) => void;

function constructButton(b: TableToolBarElem, onclick: FClickButton): React.ReactNode {
  let messid = "";
  let iconid: string | undefined = b.icon;

  switch (b.id) {
    case TOOLADD:
      messid = "addaction";
      iconid = "pluscircleoutlined";
      break;
  }

  const icon: React.ReactNode | undefined = iconid
    ? getIcon(iconid)
    : undefined;

  const bu = (
    <Button key={b.id} icon={icon} {...b.props} onClick={() => onclick(b)}>
      {lstring(messid)}
    </Button>
  );

  return bu;
}

const HeaderTable: React.FC<ColumnList> = (props) => {
  const [modalProps, setIsModalVisible] = useState<ModalListProps>(emptyModalListProps);

  const h: TableToolBar = props.toolbar as TableToolBar;

  const fmodalhook = (e: React.MouseEvent<HTMLElement>) => {
    if (!ismaskClicked(e)) setIsModalVisible(emptyModalListProps);
  };


  function clickButton(b: TableToolBarElem) {
    log(b.id);
    const res: ClickResult = clickAction(b, {})
    setIsModalVisible({ ...res, visible: true, closehook: fmodalhook })
  }
  return (
    <React.Fragment>
      <PageHeader extra={h.map((e: TableToolBarElem) => constructButton(e, clickButton))} />
      <ModalForm {...modalProps} />
    </React.Fragment>
  );
};

export default HeaderTable;
