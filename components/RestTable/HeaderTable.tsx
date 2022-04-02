import React, { useState } from "react";
import { PageHeader } from "antd";

import type { FRefresh, TCloseFunction, TableToolBar, ModalListProps, ClickResult, ButtonAction, ColumnList } from './typing'
import { emptyModalListProps } from "./typing";
import { trace } from "../../ts/l";
import { clickAction } from './js/helper'
import constructButton from "./js/constructbutton";
import ModalDialog from './ModalDialog'
import type { TRow} from '../../ts/typing'


function ltrace(mess: string) {
  trace('HeaderTable', mess)
}


const HeaderTable: React.FC<ColumnList & { refresh: FRefresh }> = (props) => {
  const [modalProps, setIsModalVisible] = useState<ModalListProps>(emptyModalListProps);

  const h: TableToolBar = props.toolbar as TableToolBar;

  const fmodalhook: TCloseFunction = (button?: ButtonAction, t?: TRow) => {
    setIsModalVisible(emptyModalListProps);
  };

  function clickButton(b: ButtonAction) {
    ltrace(b.id)
    const res: ClickResult = clickAction(b, {})
    setIsModalVisible({ ...res, visible: true, closeModal: fmodalhook })
  }

  return (
    <React.Fragment>
      <PageHeader extra={h.map((e: ButtonAction) => constructButton(e, clickButton))} />
      <ModalDialog {...modalProps} refresh={props.refresh} />
    </React.Fragment>
  );
};

export default HeaderTable;
