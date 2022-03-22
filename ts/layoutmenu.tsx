import { Menu } from "antd";
import React from "react";

import { Link } from "react-router-dom";

import lstring from "./localize";
import { getLeftMenu } from "./readresource";
import type { MenuElem } from "./typing";
import defaults from "./defaults";
import getIcon from "./icons";

function provideMenu() {
  function icon(e: MenuElem): React.ReactNode {
    return getIcon(e.icon, defaults.defaultmenuicon);
  }

  return getLeftMenu().menu.map((e: MenuElem) => (
    <Menu.Item key={e.id} icon={icon(e)}>
      <Link to={"/" + e.id}>{lstring(e.id)}</Link>
    </Menu.Item>
  ));
}

export function getDefaultMenu() : string[]{
    const m: MenuElem[] = getLeftMenu().menu
    return [m[0].id]
}

export default provideMenu