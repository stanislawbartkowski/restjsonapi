import React, { useState } from "react";
import { PageHeader, Space } from "antd";

import { trace } from "../ts/l";
import constructButton from "./ts/constructbutton";
import { emptyModalListProps, FAction, ModalFormProps, RestTableParam, TRow } from '../ts/typing'
import { TableToolBar, ButtonAction, ClickResult, ShowDetails } from "./ts/typing";
import { clickAction} from "./ts/helper";
import OneRowTable from './ShowDetails/OneRowTable'
import RestComponent from "./RestComponent";
import { isObject, makeMessage } from "../ts/j";


function ltrace(mess: string) {
  trace('HeaderTable', mess)
}

function isChooseButton(a: ClickResult, t: RestTableParam) : boolean {
  return (t.choosing !== undefined && t.choosing && a.list === undefined && a.listdef === undefined)
}

function headerTitle(p: ShowDetails, vars?: TRow) {
  if (p.title === undefined) return undefined
  const title : string = makeMessage(p.title, { r: vars as TRow }) as string

  if (isObject(p.title) && p.title?.props) {
    return { title : <Space {...p.props}> {title} </Space> }
  }
  else return { title : title }
}

const HeaderTable: React.FC<ShowDetails & { refreshaction: FAction, vars?: TRow, r: RestTableParam, fbutton: FAction }> = (props) => {
  const [modalProps, setIsModalVisible] = useState<ModalFormProps>(emptyModalListProps);

  const h: TableToolBar = props.toolbar as TableToolBar;

  const fmodalhook: FAction = () => {
    setIsModalVisible(emptyModalListProps);
  };

  function clickButton(b: ButtonAction) {
    ltrace(b.id)
    const res: ClickResult = clickAction(b, { r: {}, vars: props.vars })
    if (isChooseButton(res,props.r)) props.fbutton(b)
    else setIsModalVisible({ ...res, visible: true, closeAction: fmodalhook })
  }

  const title = headerTitle(props,props.vars);

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
      <RestComponent {...modalProps} refreshaction={props.refreshaction} />
    </React.Fragment>
  );
};

export default HeaderTable;
