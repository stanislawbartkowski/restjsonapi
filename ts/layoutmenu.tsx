import { Menu } from "antd";
import React, { ReactNode } from "react";
import SubMenu from "antd/lib/menu/SubMenu";

import { Link } from "react-router-dom";

import lstring from "./localize";
import { getLeftMenu, getMenuElemsOnly, isSubMenu } from "./leftmenu";
import defaults from "./defaults";
import getIcon from "./icons";
import { MenuElem, TMenuNode, TSubMenu } from "./typing";


function icon(e: TMenuNode): React.ReactNode {
  return getIcon(e.icon, defaults.defaultmenuicon);
}

function createMenu(e: TMenuNode): ReactNode {
  return isSubMenu(e) ? <SubMenu title={lstring((e as TSubMenu).title)} >
    {(e as TSubMenu).menus.map(e => createMenu(e))}
  </SubMenu> :
    <Menu.Item key={(e as MenuElem).id} icon={icon(e)}>
      <Link to={"/" + (e as MenuElem).id}>{lstring((e as MenuElem).id)}</Link>
    </Menu.Item>;
}

function provideMenu() {
  return getLeftMenu().menu.map((e: TMenuNode) => createMenu(e))
}

export function getDefaultMenu(currpath: string): string[] {
  const m: MenuElem[] = getMenuElemsOnly()
  if (currpath === undefined || currpath === "/") return [m[0].id]
  const mm: MenuElem | undefined = m.find(e => "/" + e.id === currpath)
  if (mm === undefined) return [m[0].id]
  return [mm.id]
}

export default provideMenu
