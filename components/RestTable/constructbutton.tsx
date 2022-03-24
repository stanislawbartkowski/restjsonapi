import { Button } from "antd";

import getIcon from "../../ts/icons";
import lstring from "../../ts/localize";
import { BUTTONACTION, ButtonAction } from "./typing";

export type FClickButton = (b: ButtonAction) => void;


function constructButton(b: ButtonAction, onclick: FClickButton): React.ReactNode {
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
  }

  const icon: React.ReactNode | undefined = iconid
    ? getIcon(iconid)
    : undefined;

  const bu =
    <Button key={b.id} icon={icon} {...b.props} onClick={() => onclick(b)}>
      {lstring(messid)}
    </Button>
    ;

  return bu;
}

export default constructButton