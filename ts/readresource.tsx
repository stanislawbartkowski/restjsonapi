import { restapiresource } from "../services/api";
import { log } from "../ts/l";
import { setStrings } from "./localize";
import type { MenuLeft } from "./typing";

let leftmenu: MenuLeft = { menu: [] };

export function getLeftMenu(): MenuLeft {
  return leftmenu;
}

async function readResource() {
  leftmenu = (await restapiresource("leftmenu")) as MenuLeft;
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
