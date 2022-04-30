import React, { useState } from "react";
import { PageHeader } from "antd";

import type { FRefresh, TCloseFunction, ModalListProps } from './typing'
import { emptyModalListProps } from "./typing";
import { trace } from "../../ts/l";
import constructButton from "./js/constructbutton";
import ModalDialog from './ModalDialog'
import type { TRow } from '../../ts/typing'
import { TableToolBar, ButtonAction, ClickResult, ShowDetails } from "../ts/typing";
import { clickAction, makeMessage } from "../ts/helper";
import OneRowTable from '../ShowDetails/OneRowTable'


function ltrace(mess: string) {
  trace('HeaderTable', mess)
}


const HeaderTable: React.FC<ShowDetails & { refresh: FRefresh, vars?: TRow }> = (props) => {
  const [modalProps, setIsModalVisible] = useState<ModalListProps>(emptyModalListProps);

  const h: TableToolBar = props.toolbar as TableToolBar;

  const fmodalhook: TCloseFunction = (button?: ButtonAction, t?: TRow) => {
    setIsModalVisible(emptyModalListProps);
  };

  function clickButton(b: ButtonAction) {
    ltrace(b.id)
    const res: ClickResult = clickAction(b, { r: {}, vars: props.vars })
    setIsModalVisible({ ...res, visible: true, closeModal: fmodalhook })
  }

  const title = props.title ? { title: makeMessage(props.title, { r: props.vars as TRow }) } : undefined;

  const detaDescr = {
    r: props.vars as TRow,
    ...props.collist
  }

  const headerprops = props.collist ? {...props.collist.props} : undefined

  return (
    <React.Fragment>
      <PageHeader {...title} 
        {...headerprops}
        extra={h ? h.map((e: ButtonAction) => constructButton(e, clickButton)) : undefined} >
        {props.collist ? <OneRowTable { ...detaDescr} /> : undefined}
      </PageHeader>
      <ModalDialog {...modalProps} refresh={props.refresh} />
    </React.Fragment>
  );
};

export default HeaderTable;
