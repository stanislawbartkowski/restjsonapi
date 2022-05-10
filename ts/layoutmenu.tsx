import { Menu } from "antd";
import React, { ReactNode } from "react";
import SubMenu from "antd/lib/menu/SubMenu";

import { Link } from "react-router-dom";

import lstring from "./localize";
import { getLeftMenu, getMenuElemsOnly, isSubMenu } from "./leftmenu";
import defaults from "./defaults";
import getIcon from "./icons";
import { MenuElem, TMenuNode, TSubMenu } from "./typing";
import { getButtonName } from "./j";


function icon(e: TMenuNode): React.ReactNode {
  return getIcon(e.icon, defaults.defaultmenuicon);
}


function flattenMenu(m : TMenuNode[] ) : MenuElem[] {

  let e : MenuElem[] = []

  m.forEach(ee => {
    if (isSubMenu(ee)) e = e.concat(flattenMenu((ee as TSubMenu).menus))
    else e.push(ee as MenuElem)
  })

  return e

}

export function getMenuNameByLocation(id : string) : string {
  const i : string = id.substring(1); // remove leading /
  const el : MenuElem[] = flattenMenu(getLeftMenu().menu)
  const e: TMenuNode|undefined = el.find(e => (e as MenuElem).id === i)

  if (e === undefined) return "????"

  return getButtonName(e as MenuElem)
}

// global, to increase keynumber for submenu to bypass recursion
let keysub : number 

function createMenu(e: TMenuNode): ReactNode {

  return isSubMenu(e) ? <SubMenu key={keysub++} title={lstring((e as TSubMenu).title)} >
    {(e as TSubMenu).menus.map(e => createMenu(e))}
  </SubMenu> :

    <Menu.Item key={(e as MenuElem).id} icon={icon(e)}>
      <Link to={"/" + (e as MenuElem).id}>{getButtonName(e as MenuElem)}</Link>
    </Menu.Item>;
}

function provideMenu() {
  keysub = 0
  return getLeftMenu().menu.map((e: TMenuNode) => createMenu(e))
}

export function getDefaultMenu(currpath: string): string[] {
  const m: string[] = getMenuElemsOnly()
  if (currpath === undefined || currpath === "/") return [m[0]]
  const mm: string | undefined = m.find(e => "/" + e === currpath)
  if (mm === undefined) return [m[0]]
  return [mm]
}

export default provideMenu
