import { Button, Popconfirm } from "antd";
import { Space, Typography } from 'antd';

import getIcon from "../../ts/icons";
import lstring from "../../ts/localize";
import { BUTTONACTION } from "./typing";
import { getButtonName, getButtonNameIcon, isBool, makeMessage } from '../../ts/j'
import { ButtonAction } from "./typing";
import { FButtonAction, FormMessage } from "../../ts/typing";
import { istrue } from "./helper";

export function constructButtonElem(b: ButtonAction, fclick: FButtonAction, disabled?: boolean, loading?: boolean): React.ReactNode {

  const [bname, iconid] = getButtonNameIcon(b)

  const loadingprop: Record<string, any> = loading ? { loading: true } : {}
  const disabledprop: Record<string, any> = disabled ? { disabled: true } : {}
  const onclickprops: Record<string, any> = {
    onClick: () =>
      fclick(b)
  }

  const icon: React.ReactNode | undefined = iconid
    ? getIcon(iconid)
    : undefined;

  if (istrue(b.noaction)) {
    const text = makeMessage(b)
    return <Typography.Text {...b.props}>{text}</Typography.Text>
  }

  const bu =
    <Button key={b.id} icon={icon} {...b.props} {...loadingprop} {...disabledprop} {...onclickprops}>
      {bname}
    </Button>
    ;

  return bu;

}

function contructConfirm(b: ButtonAction, click: FButtonAction, disabled?: boolean, loading?: boolean) {
  const title: string = isBool(b.confirm) ? lstring('areyousure') : makeMessage(b.confirm as FormMessage, { r: {} }) as string

  function onConfirm() {
    click(b)
  }

  return <Popconfirm title={title} onConfirm={onConfirm}>  {constructButtonElem(b, () => { }, disabled, loading)} </Popconfirm>
}

function constructButton(b: ButtonAction, click: FButtonAction, disabled?: boolean, loading?: boolean): React.ReactNode {


  if (!b.confirm) return constructButtonElem(b, click, disabled, loading);
  return contructConfirm(b, click, disabled, loading)
}

export default constructButton