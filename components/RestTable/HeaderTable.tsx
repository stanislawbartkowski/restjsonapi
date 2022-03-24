import React, { useState } from "react";
import { PageHeader } from "antd";

import type { TCloseFunction, TableToolBar, ColumnList, ModalListProps, ClickResult, ButtonAction, TRow } from './typing'
import { emptyModalListProps } from "./typing";
import ModalForm from "./ModalForm";
import { trace } from "../../ts/l";
import { clickAction } from './helper'
import constructButton from "./constructbutton";

function ltrace(mess: string) {
  trace('HeaderTable', mess)
}

const HeaderTable: React.FC<ColumnList> = (props) => {
  const [modalProps, setIsModalVisible] = useState<ModalListProps>(emptyModalListProps);

  const h: TableToolBar = props.toolbar as TableToolBar;

  const fmodalhook: TCloseFunction = (button?: ButtonAction, r?: TRow) => {
    ltrace(`Form button clicked ${button?.id}`)
    if (button === undefined) {
      setIsModalVisible(emptyModalListProps);
      return;
    }
    const res: ClickResult = clickAction(button, r)
    if (res.close) setIsModalVisible(emptyModalListProps);
  };


  function clickButton(b: ButtonAction) {
    ltrace(b.id)
    const res: ClickResult = clickAction(b, {})
    setIsModalVisible({ ...res, visible: true, closeModal: fmodalhook })
  }

  return (
    <React.Fragment>
      <PageHeader extra={h.map((e: ButtonAction) => constructButton(e, clickButton))} />
      <ModalForm {...modalProps} />
    </React.Fragment>
  );
};

export default HeaderTable;
