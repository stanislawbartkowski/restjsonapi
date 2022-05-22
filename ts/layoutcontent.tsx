import { Route } from "react-router-dom";
import { getMenuElemsOnly } from "./leftmenu";
import { getMenuElement, getDirMenuElems, getMenuDirElement } from './constructRestElement'

export function getRouterContent() {
  return getMenuElemsOnly().map((e: string) => (
    <Route
      key={e}
      path={"/" + e}
      element={getMenuElement(e)}
    />
  ));
}

export function getRouterContentDir() {
  return getDirMenuElems().map((e: string) => (
    <Route
      key={e + "submenu"}
      path={"/" + e + "/:id"}
      element={getMenuDirElement(e)}
    />
  ));
}

