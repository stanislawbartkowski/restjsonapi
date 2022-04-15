import { Button, Popconfirm } from "antd";

import getIcon from "../../../ts/icons";
import lstring from "../../../ts/localize";
import { BUTTONACTION } from "../typing";
import { isBool } from '../../../ts/j'
import { makeMessage } from "../../ts/helper";
import { ButtonAction, FormMessage } from "../../ts/typing";

export type FClickButton = (b: ButtonAction) => void;


function constructButton(b: ButtonAction, onclick: FClickButton, disabled?: boolean, loading?: boolean): React.ReactNode {
  let messid = "";
  let iconid: string | undefined = b.icon;

  switch (b.id) {
    case BUTTONACTION.ADD:
      messid = "addaction";
      iconid = "pluscircleoutlined";
      break;
    case BUTTONACTION.ACCEPT:
      messid = 'acceptaction';
      break;
    case BUTTONACTION.CANCEL:
      messid = 'cancelaction';
      break;
    case BUTTONACTION.DEL:
      messid = 'delete';
      iconid = 'deleteoutlined';
      break;
    case BUTTONACTION.UPDATE :
      messid = 'update'
      iconid = 'editoutlines'
      break
  }

  const loadingprop: Record<string, any> = loading ? { loading: true } : {}
  const disabledprop: Record<string, any> = disabled ? { disabled: true } : {}
  const onclickprops: Record<string, any> = b.confirm ? {} : { onClick: () => onclick(b) }

  const icon: React.ReactNode | undefined = iconid
    ? getIcon(iconid)
    : undefined;

  const bu =
    <Button key={b.id} icon={icon} {...b.props} {...loadingprop} {...disabledprop} {...onclickprops}>
      {lstring(messid)}
    </Button>
    ;

  if (!b.confirm) return bu

  const title: string = isBool(b.confirm) ? lstring('areyousure') : makeMessage(b.confirm as FormMessage) as string

  return <Popconfirm title={title} onConfirm={() => onclick(b)} > {bu} </Popconfirm>
}

export default constructButton