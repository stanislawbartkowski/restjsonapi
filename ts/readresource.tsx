import { ReactNode } from "react";
import { restapiresource } from "../services/api";
import { log } from "../ts/l";
import { setStrings } from "./localize";
import type { MenuElem, MenuLeft, RestTableParam } from "./typing";
import RestTable from '../components/RestTable'

export type LeftMenuElem = MenuElem & {
  id: string
  elem: ReactNode
}

//const leftmenu: MenuLeft = { menu: [] };

const leftmenu: LeftMenuElem[] = []

export function getLeftMenu(): LeftMenuElem[] {
  return leftmenu;
}

export function addLeftMenuElem(t: LeftMenuElem) {
  leftmenu.push(t)
}

function toLeftMenuElem(e: MenuElem): LeftMenuElem {

  return { ...e, elem: <RestTable list={e.list ? e.list : e.id} /> }
}

async function readResource() {
  const lm: MenuLeft = (await restapiresource("leftmenu")) as MenuLeft;
  //  leftmenu.menu.concat(lm.menu)
  lm.menu.forEach((e: MenuElem) => {
    leftmenu.push(toLeftMenuElem(e))
  })

  log("Resource leftmenu read");
  const appdata: any = await restapiresource("appdata");
  log("Resource appdata read");

  const language: string | undefined = appdata.language

  if (language) log(`Language ${language} read from appdata`)
  else log(`Language not specifed in the appdata, default is used`)


  const strings: any = await restapiresource("strings");
  log("Resource strings read");
  setStrings(strings, language);
}

export default readResource;
