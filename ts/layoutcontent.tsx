import { Route } from "react-router-dom";
import { getMenuElemsOnly } from "./leftmenu";
import { MenuElem } from './typing'
import { getMenuElement } from './constructRestElement'

function getRouterContent() {
  return getMenuElemsOnly().map((e: MenuElem) => (
    <Route
      key={e.id}
      path={"/" + e.id}
      element={getMenuElement(e.id)}
    />
  ));
}

export default getRouterContent;
