import { Menu } from "antd";
import React, { ReactNode } from "react";
import SubMenu from "antd/lib/menu/SubMenu";

import { Link } from "react-router-dom";

import lstring from "./localize";
import { getLeftMenu, getMenuElemsOnly, isSubMenu } from "./leftmenu";
import defaults from "./defaults";
import getIcon from "./icons";
import { FormMessage, MenuElem, TMenuNode, TSubMenu } from "./typing";
import { getButtonName, isString, makeMessage, removeDomain } from "./j";

import { getLastMenuName } from '../components/MenuComps'
import { getRouterRoot } from "./url";


function icon(e: TMenuNode): React.ReactNode {
  return getIcon(e.icon, defaults.defaultmenuicon);
}


function flattenMenu(m: TMenuNode[]): MenuElem[] {

  let e: MenuElem[] = []

  m.forEach(ee => {
    if (isSubMenu(ee)) e = e.concat(flattenMenu((ee as TSubMenu).menus))
    else e.push(ee as MenuElem)
  })

  return e

}

export function getMenuNameByLocation(id: string): string {
  const i: string = removeDomain(id)
  const el: MenuElem[] = flattenMenu(getLeftMenu().menu)
  let e: TMenuNode | undefined = el.find(e => (e as MenuElem).id === i)

  if (e === undefined) {
    if (getLastMenuName() !== undefined) return getLastMenuName() as string
  }
  if (e === undefined) return "????"

  return getButtonName(e as MenuElem)
}

// global, to increase keynumber for submenu to bypass recursion
let keysub: number

function submenutitle(e: TSubMenu): string {
  if (isString(e.title)) return lstring(e.title as string);
  return makeMessage(e.title as FormMessage) as string
}

function createMenu(e: TMenuNode): ReactNode {

  return isSubMenu(e) ? <SubMenu key={keysub++} title={submenutitle(e as TSubMenu)} >
    {(e as TSubMenu).menus.map(e => createMenu(e))}
  </SubMenu> :

    <Menu.Item key={(e as MenuElem).id} icon={icon(e)}>
      <Link to={getRouterRoot() + (e as MenuElem).id}>{getButtonName(e as MenuElem)}</Link>
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
