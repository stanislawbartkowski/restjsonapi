import { Route } from "react-router";
import { getMenuElemsOnly } from "./leftmenu";
import { getMenuElement, getDirMenuElems, getMenuDirElement } from './constructRestElement'
import { getRouterRoot } from "./url";

export function getRouterContent() {
  return getMenuElemsOnly().map((e: string) => (
    <Route
      key={e}
      path={getRouterRoot() + e}
      element={getMenuElement(e)}
    />
  ));
}

export function getRouterContentDir() {
  return getDirMenuElems().map((e: string) => (
    <Route
      key={e + "submenu"}
      path={getRouterRoot() + e + "/:id"}
      element={getMenuDirElement(e)}
    />
  ));
}


