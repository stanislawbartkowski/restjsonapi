import { ReactNode } from "react";
import { restapijs, restapiresource } from "../services/api";
import { log } from "./l";
import { setStrings } from "./localize";
import type { AppDefaults, FieldDefaults, MenuLeft } from "./typing";
import { setLeftMenu } from './leftmenu'


let appdefaults : AppDefaults| undefined = undefined

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


let appdata: any | undefined = undefined

export function getAppData(): any | undefined {
  return appdata
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
  const lm: MenuLeft = (await restapiresource("leftmenu")) as MenuLeft;
  setLeftMenu(lm)


  log("Resource leftmenu read");
  appdata = await restapiresource("appdata");
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
}

export default readResource;
