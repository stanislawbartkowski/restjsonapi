import { Button, Popconfirm } from "antd";
import { Typography } from 'antd';

import getIcon from "../../ts/icons";
import lstring from "../../ts/localize";
import { getButtonNameIcon, isBool, makeMessage } from '../../ts/j'
import { ButtonAction } from "./typing";
import { FButtonAction, FormMessage, OneRowData } from "../../ts/typing";
import { isFieldTrue, istrue } from "./helper";

export function constructButtonElem(b: ButtonAction, fclick: FButtonAction, pars: OneRowData, disabled?: boolean, loading?: boolean,): React.ReactNode {

  const [bname, iconid] = getButtonNameIcon(b)

  const loadingprop: Record<string, any> = loading ? { loading: true } : {}
  const disabledprop: Record<string, any> = disabled ? { disabled: true } : {}
  const onclickprops: Record<string, any> = {
    onClick: () =>
      fclick(b)
  }

  const hidden = {
    "hidden": isFieldTrue(b.hidden, pars)
  }

  const icon: React.ReactNode | undefined = iconid
    ? getIcon(iconid)
    : undefined;

  if (istrue(b.noaction)) {
    const text = makeMessage(b)
    return <Typography.Text {...b.props}>{text}</Typography.Text>
  }

  const bu =
    <Button key={b.id} icon={icon} {...b.props} {...loadingprop} {...disabledprop} {...onclickprops} {...hidden} >
      {bname}
    </Button>
    ;

  return bu;

}

function contructConfirm(b: ButtonAction, click: FButtonAction, pars: OneRowData, disabled?: boolean, loading?: boolean) {
  const title: string = isBool(b.confirm) ? lstring('areyousure') : makeMessage(b.confirm as FormMessage, { r: {} }) as string

  function onConfirm() {
    click(b)
  }

  return <Popconfirm title={title} onConfirm={onConfirm}>  {constructButtonElem(b, () => { }, pars, disabled, loading)} </Popconfirm>
}

function constructButton(b: ButtonAction, click: FButtonAction, pars: OneRowData, disabled?: boolean, loading?: boolean): React.ReactNode {


  if (!b.confirm) return constructButtonElem(b, click, pars, disabled, loading);
  return contructConfirm(b, click, pars, disabled, loading)
}

export default constructButton