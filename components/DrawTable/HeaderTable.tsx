import React, { useState } from "react";
import { PageHeader } from "antd";

import { emptyModalListProps } from "./typing";
import { trace } from "../../ts/l";
import constructButton from "../ts/constructbutton";
import type { FAction, ModalFormProps, TRow } from '../../ts/typing'
import { TableToolBar, ButtonAction, ClickResult, ShowDetails } from "../ts/typing";
import { clickAction, makeMessage } from "../ts/helper";
import OneRowTable from '../ShowDetails/OneRowTable'
import RestComponent from "../RestComponent";


function ltrace(mess: string) {
  trace('HeaderTable', mess)
}


const HeaderTable: React.FC<ShowDetails & { refresh: FAction, vars?: TRow }> = (props) => {
  const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);

  const h: TableToolBar = props.toolbar as TableToolBar;

  const fmodalhook: FAction = () => {
    setIsModalVisible(emptyModalListProps);
  };

  function clickButton(b: ButtonAction) {
    ltrace(b.id)
    const res: ClickResult = clickAction(b, { r: {}, vars: props.vars })
    setIsModalVisible({ ...res, visible: true, closeAction: fmodalhook })
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
      <RestComponent {...modalProps} refresh={props.refresh} />
    </React.Fragment>
  );
};

export default HeaderTable;
