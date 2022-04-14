import { ReactNode } from "react";
import { restapiresource } from "../services/api";
import { log } from "./l";
import { setStrings } from "./localize";
import type { MenuLeft } from "./typing";
import {setLeftMenu} from './leftmenu'


let headerLine: ReactNode | undefined = undefined

export function setHeaderLine(h: ReactNode) {
  headerLine = h
}

export function getHeaderLine(): ReactNode | undefined {
  return headerLine
}


let appdata: any | undefined = undefined

export function getAppData(): any | undefined {
  return appdata
}


async function readResource() {
  const lm: MenuLeft = (await restapiresource("leftmenu")) as MenuLeft;
  setLeftMenu(lm)
  

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
