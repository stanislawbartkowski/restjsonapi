import { restapiresource } from "../services/api";
import { log } from "../ts/j";
import { setStrings } from "./localize";
import type { MenuLeft } from "./typing";

let leftmenu: MenuLeft = { menu: [] };

export function getLeftMenu(): MenuLeft {
  return leftmenu;
}

async function readResource() {
  const strings: any = await restapiresource("strings");
  log("Resource strings read");
  setStrings(strings);
  leftmenu = (await restapiresource("leftmenu")) as MenuLeft;
  log("Resource leftmenu read");
  const appdata: any = await restapiresource("appdata");
  log("Resource appdata read");
}

export default readResource;
