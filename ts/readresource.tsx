import { ReactNode } from "react";
import { restapiresource } from "../services/api";
import { log } from "./l";
import { setStrings } from "./localize";
import type { MenuElem, MenuLeft, RestTableParam } from "./typing";
import RestTable from '../components/RestTable'

export type LeftMenuElem = MenuElem & {
  id: string
  elem: ReactNode
}

type MenuRoute = {
  rootredirect: string
}

let resttableProps: RestTableParam = {}

let menuroute: MenuRoute | undefined = undefined

let headerLine: ReactNode | undefined = undefined

export function setHeaderLine(h: ReactNode) {
  headerLine = h
}

export function getHeaderLine(): ReactNode | undefined {
  return headerLine
}

export function setMenuRoute(p: MenuRoute) {
  menuroute = p
}

export function getMenuRoute(): MenuRoute | undefined {
  return menuroute
}

export function setRestTableProps(p: RestTableParam) {
  resttableProps = p
}


const leftmenu: LeftMenuElem[] = []

let appdata: any | undefined = undefined

export function getAppData(): any | undefined {
  return appdata
}

export function getLeftMenu(): LeftMenuElem[] {
  return leftmenu;
}

export function addLeftMenuElem(t: LeftMenuElem) {
  leftmenu.push(t)
}

function toLeftMenuElem(e: MenuElem): LeftMenuElem {

  return { ...e, elem: <RestTable list={e.list ? e.list : e.id} {...resttableProps} /> }
}

async function readResource() {
  const lm: MenuLeft = (await restapiresource("leftmenu")) as MenuLeft;
  //  leftmenu.menu.concat(lm.menu)
  lm.menu.forEach((e: MenuElem) => {
    leftmenu.push(toLeftMenuElem(e))
  })

  log("Resource leftmenu read");
  appdata = await restapiresource("appdata");
  log("Resource appdata read");

  const language: string | undefined = appdata.language

  if (language) log(`Language ${language} read from appdata`)
  else log(`Language not specifed in the appdata, default is used`)


  const strings: any = await restapiresource("strings");
  log("Resource strings read");
  setStrings(strings, language);
}

export default readResource;
