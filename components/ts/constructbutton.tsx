import { Button, Popconfirm } from "antd";

import getIcon from "../../ts/icons";
import lstring from "../../ts/localize";
import { BUTTONACTION } from "./typing";
import { getButtonName, isBool, makeMessage } from '../../ts/j'
import { ButtonAction } from "./typing";
import { FormMessage } from "../../ts/typing";

export type FClickButton = (b: ButtonAction) => void;

export function constructButtonElem(b: ButtonAction, onclick: FClickButton, disabled?: boolean, loading?: boolean): React.ReactNode {
  let messid = "";
  let iconid: string | undefined = b.icon;

  if (b.id !== undefined)
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
      case BUTTONACTION.UPDATE:
        messid = 'update'
        iconid = 'editoutlines'
        break
      case BUTTONACTION.PRINT:
        messid = 'print'
        iconid = 'printoutlined'
        break
      case BUTTONACTION.CHOOSE:
        messid = 'chooseaction'
        iconid = 'checkoutlined'
        break;
      case BUTTONACTION.NEXT:
        messid = 'next'
        iconid = 'stepsforwardoutlined'
        break;
      case BUTTONACTION.PREV:
        messid = 'prev'
        iconid = 'stepsbackwardoutlined'
        break;
      case BUTTONACTION.UPLOAD:
        messid = 'upload'
        iconid = 'uploadoutlined'
        break;
      case BUTTONACTION.OK:
        messid = 'ok';
        iconid = 'checkoutlined';
        break
    }

  const bname: String = messid !== "" ? lstring(messid) : getButtonName(b)

  const loadingprop: Record<string, any> = loading ? { loading: true } : {}
  const disabledprop: Record<string, any> = disabled ? { disabled: true } : {}
  const onclickprops: Record<string, any> = {
    onClick: () =>
      onclick(b)
  }


  const icon: React.ReactNode | undefined = iconid
    ? getIcon(iconid)
    : undefined;

  const bu =
    <Button key={b.id} icon={icon} {...b.props} {...loadingprop} {...disabledprop} {...onclickprops}>
      {bname}
    </Button>
    ;

  return bu;

}

function constructButton(b: ButtonAction, click: FClickButton, disabled?: boolean, loading?: boolean): React.ReactNode {


  if (!b.confirm) return constructButtonElem(b, click, disabled, loading);

  const title: string = isBool(b.confirm) ? lstring('areyousure') : makeMessage(b.confirm as FormMessage, { r: {} }) as string

  return <Popconfirm title={title} onConfirm={() => click(b)}  > {constructButtonElem(b, () => { }, disabled, loading)} </Popconfirm>
}

export default constructButton