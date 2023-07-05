import { ReactNode } from "react";
import { restapijs, restapilist, restapilistdef, restapiresource } from "../services/api";
import { log } from "./l";
import { setStrings } from "./localize";
import type { AppData, AppDefaults, FieldDefaults, LeftMenuResource, MenuLeft } from "./typing";
import { setLeftMenu } from './leftmenu'
import { emptys } from "../components/ts/helper";


let appdefaults : AppDefaults

export function findLabel(label: string) : FieldDefaults | undefined {

  return appdefaults?.fields.find( e => e.label === label)

}

let headerLine: ReactNode | undefined = undefined

export function setHeaderLine(h: ReactNode) {
  headerLine = h
}

export function getHeaderLine(): ReactNode | undefined {
  return headerLine
}


let appdata: AppData | undefined = undefined

export function getAppData(): AppData  {
  return appdata as AppData
}

let jsscript: string[] = []

export function getAppJSS() : string[] {
  return jsscript
}

async function readJS(jnames: string) {
  const js: string[] = jnames.split(",")
  jsscript = await Promise.all(js.map(async j => {
    return await restapijs(j)
  })
  )
}

async function readResource() {
  
  appdata = await restapiresource("appdata") as AppData
  log("Resource appdata read");

  appdefaults = await restapiresource("defaults") as AppDefaults
  log("App defaults read")

  const js: string | undefined = appdata.js

  if (js) {
    log(`JS scripts to read ${js}`)
    await readJS(js)
  }

  const language: string | undefined = appdata.language

  if (language) log(`Language ${language} read from appdata`)
  else log(`Language not specifed in the appdata, default is used`)


  const strings: any = await restapiresource("strings");
  log("Resource strings read");
  setStrings(strings, language);

  let leftmenu: string = "leftmenu"
  if (! emptys(appdata.getleftmenu)) {
    const geturl: string = appdata.getleftmenu as string
    const l : LeftMenuResource = await restapilist(geturl) as LeftMenuResource
    if (! emptys(l.leftmenu)) leftmenu = l.leftmenu
  }

  const lm: MenuLeft = (await restapiresource(leftmenu)) as MenuLeft;
  setLeftMenu(lm)
  log("Resource leftmenu read");

}

export default readResource;
